import { Entity } from "/src/common/entity.ts";
import { Block, BlockType, VecEq, Vector, ZP } from "/src/common/types.ts";
import { LevelMap } from "/src/common/map.ts";

type PhysicsBody = { position: Vector; block: Block; isStatic: boolean };

enum Origin {
    client = "client",
    server = "server",
}

export class Engine {
    static readonly gravity = 0.040;
    static readonly frictionCoef = -0.150;
    static readonly normalForceRatio = 1.5;
    static readonly minimumNormalForce = 0;

    constructor(
        readonly origin: Origin,
        readonly map: LevelMap,
        readonly player: Entity,
        readonly entities: Entity[],
    ) {}

    tick(deltaTime = 1): Entity[] {
        const updates = [];

        for (const collision of this.detector()) {
            this.resolver(collision);
        }

        for (const entity of this.entities) {
            const pos = { ...entity.position }; // copy so tickEntity can mutate
            this.tickEntity(entity, deltaTime);
            if (pos.x != entity.position.x || pos.y != entity.position.y) {
                updates.push(entity);
            }
        }

        return updates;
    }

    tickEntity(entity: Entity, deltaTime = 1) {
        if (entity.block == "P") {
            //console.log("tickEntity", entity);
        }
        entity.tick(deltaTime);

        // accel is for gravity or friction accel.
        const accel = ZP();

        entity.velocity.x += (entity.acceleration.x + accel.x) * deltaTime;
        entity.velocity.y += (entity.acceleration.y + accel.y) * deltaTime;

        entity.position.x += entity.velocity.x * deltaTime;
        entity.position.y += entity.velocity.y * deltaTime;

        entity.position.x = clamp(entity.position.x, 0, this.map.width);
        entity.position.y = clamp(entity.position.y, 0, this.map.height);
    }

    public resolver(collisionPair: PhysicsBody[]) {
        const body1 = collisionPair[0];
        const body2 = collisionPair[1];
        console.log("Resolving collision...", body1, body2);

        /* Involves a static body */
        if (body1.isStatic || body2.isStatic) {
            let staticBody: PhysicsBody;
            let dynamicBody: PhysicsBody;
            if (body1.isStatic) {
                staticBody = body1;
                dynamicBody = body2;
            } else {
                staticBody = body2;
                dynamicBody = body1;
            }

            const diff = {
                x: staticBody.position.x - dynamicBody.position.x,
                y: staticBody.position.y - dynamicBody.position.y,
            };

            this.applyNormalForce(dynamicBody, diff);

            /* Does not involve a static body */
        } else {
            const diff = {
                x: body1.position.x - body2.position.x,
                y: body1.position.y - body2.position.y,
            };

            this.applyNormalForces(body1, body2, diff);
        }
    }

    public detector(): PhysicsBody[][] {
        return (this.origin == Origin.server) ? this.serverDetector() : this.clientDetector();
    }

    private serverDetector(): PhysicsBody[][] {
        /*
        const bodies: PhysicsBody[] = [];
        this.entities.forEach((e: Entity) => bodies.push(e));
        // TODO: Make this look for all surroundingBlocks near each entity, only unique blocks
        this.surroundingBlocks(this.player.position).forEach((e: PhysicsBody) => bodies.push(e));
        return this.getCollisionPairs(bodies, (body1: PhysicsBody, body2: PhysicsBody): boolean => {
            return body1.block != "P" && body2.block == "P";
        });
        */
        return [];
    }

    private clientDetector(): PhysicsBody[][] {
        const bodies: PhysicsBody[] = [];
        bodies.push(this.player);
        this.entities.forEach((e: Entity) => {
            if (e.block != "P") bodies.push(e);
        });
        this.surroundingBlocks(this.player.position).forEach((e: PhysicsBody) => bodies.push(e));
        return this.getCollisionPairs(bodies, (body1: PhysicsBody, body2: PhysicsBody): boolean => {
            return body1.block == "P" || body2.block == "P";
        });
    }

    private getCollisionPairs(physicsBodies: PhysicsBody[], condition: (b1: PhysicsBody, b2: PhysicsBody) => boolean) {
        const intersectingBodies: PhysicsBody[][] = [];
        for (const i in physicsBodies) {
            for (const j in physicsBodies) {
                if (i == j) continue;
                const body1 = physicsBodies[i];
                const body2 = physicsBodies[j];
                if (condition(body1, body2) && intersection(body1, body2)) intersectingBodies.push([body1, body2]);
            }
        }
        return intersectingBodies;
    }

    private surroundingBlocks(pos: Vector): PhysicsBody[] {
        const blocks: PhysicsBody[] = [];

        for (let x = Math.floor(pos.x - 1); x <= Math.ceil(pos.x + 1); x++) {
            for (let y = Math.floor(pos.y - 1); y <= Math.ceil(pos.y + 1); y++) {
                const block = this.map.at({ x, y });
                if (!block || this.map.blockType(block) != BlockType.Block) {
                    continue;
                }

                const mods = this.map.blockMods(block);
                if (mods && mods.includes("air")) {
                    continue;
                }

                blocks.push({ position: { x, y }, block, isStatic: true });
            }
        }

        return blocks;
    }

    private positionIsGround(pos: Vector): boolean {
        const block = this.map.at(pos);
        if (!block) {
            return false;
        }

        const btype = this.map.blockType(block);
        switch (btype) {
            case BlockType.Block: {
                const mods = this.map.blockMods(block);
                return !mods.includes("air");
            }
            case BlockType.Entity: {
                return this.entities.find((entity) => VecEq(entity.position, pos)) !== undefined;
            }
            default: {
                return false;
            }
        }
    }

    private applyNormalForces(body1: PhysicsBody, body2: PhysicsBody, diff: Vector) {
        console.log("Applying normal forces", diff);
        body1.position.x += Math.max(diff.x * Engine.normalForceRatio / 2, Engine.minimumNormalForce);
        body1.position.y += Math.max(diff.y * Engine.normalForceRatio / 2, Engine.minimumNormalForce);

        body2.position.x += Math.max(-diff.x * Engine.normalForceRatio / 2, Engine.minimumNormalForce);
        body2.position.y += Math.max(-diff.y * Engine.normalForceRatio / 2, Engine.minimumNormalForce);
    }

    private applyNormalForce(body: PhysicsBody, diff: Vector) {
        console.log("Applying normal force", diff);
        body.position.x += Math.max(diff.x * Engine.normalForceRatio, Engine.minimumNormalForce);
        body.position.y += Math.max(diff.y * Engine.normalForceRatio, Engine.minimumNormalForce);
    }
}

function intersection(body1: PhysicsBody, body2: PhysicsBody): boolean {
    return (Math.abs(body1.position.x - body2.position.x) < 1 && Math.abs(body1.position.y - body2.position.y) < 1);
}

function clamp(n: number, lo: number, hi: number): number {
    return Math.min(Math.max(n, lo), hi);
}
