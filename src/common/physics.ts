import { Entity } from "/src/common/entity.ts";
import { Block, BlockType, VecEq, Vector, ZP } from "/src/common/types.ts";
import { LevelMap } from "/src/common/map.ts";

type PhysicsBody = { position: Vector; block: Block; isStatic: boolean };

enum Origin {
    client = "client",
    server = "server",
}

export class Engine {
    static readonly gravity = 0.025;
    static readonly frictionCoef = 0.85;
    static readonly airFrictionCoef = 0.95;
    static readonly normalForceRatio = 1;
    static readonly minimumNormalForce = 0;
    static readonly maxSpeed = 0.5;

    constructor(
        readonly origin: Origin,
        readonly map: LevelMap,
        readonly player: Entity,
        readonly entities: Entity[],
    ) {}

    tick(deltaTime = 1): Entity[] {
        const updates = [];

        for (const entity of this.entities) {
            const pos = { ...entity.position }; // copy so tickEntity can mutate
            this.tickEntity(entity, deltaTime);
            if (pos.x != entity.position.x || pos.y != entity.position.y) {
                updates.push(entity);
            }
        }

        const collisions = this.detector();
        for (const collision of collisions) {
            this.resolver(collision);
        }

        return updates;
    }

    tickEntity(entity: Entity, deltaTime = 1) {
        entity.tick(deltaTime);

        // accel is for gravity or friction accel.
        const accel = ZP();
        accel.y = this.isGrounded(entity) ? 0 : Engine.gravity;

        const isTouchingBlock = this.isTouchingBlock(entity);

        entity.velocity.x *= isTouchingBlock ? Engine.frictionCoef : Engine.airFrictionCoef;
        entity.velocity.x += (entity.acceleration.x + accel.x) * deltaTime;
        entity.velocity.x = Math.min(entity.velocity.x, Engine.maxSpeed);
        if (Math.abs(entity.velocity.x) < 0.001) entity.velocity.x = 0;
        entity.velocity.y *= isTouchingBlock ? Engine.frictionCoef : Engine.airFrictionCoef;
        entity.velocity.y += (entity.acceleration.y + accel.y) * deltaTime;
        entity.velocity.y = Math.min(entity.velocity.y, Engine.maxSpeed);
        if (Math.abs(entity.velocity.y) < 0.001) entity.velocity.y = 0;

        entity.position.x += entity.velocity.x * deltaTime;
        entity.position.y += entity.velocity.y * deltaTime;

        entity.position.x = clamp(entity.position.x, 0, this.map.width);
        entity.position.y = clamp(entity.position.y, 0, this.map.height);
    }

    public resolver(collisionPair: PhysicsBody[]) {
        const body1 = collisionPair[0];
        const body2 = collisionPair[1];

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

            diff.x -= Math.sign(diff.x);
            diff.y -= Math.sign(diff.y);

            (dynamicBody as Entity).velocity.x *= Engine.frictionCoef;
            (dynamicBody as Entity).velocity.y *= Engine.frictionCoef;

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
        bodies.forEach((b: PhysicsBody) => {
            b.isStatic = false;
        });
        this.surroundingBlocks(this.player.position).forEach((e: PhysicsBody) => bodies.push(e));
        return this.getCollisionPairs(bodies, (body1: PhysicsBody, body2: PhysicsBody): boolean => {
            return body1.block == "P" || body2.block == "P";
        });
    }

    private getCollisionPairs(physicsBodies: PhysicsBody[], condition: (b1: PhysicsBody, b2: PhysicsBody) => boolean) {
        const intersectingBodies: PhysicsBody[][] = [];
        for (let i = 0; i < physicsBodies.length; i++) {
            for (let j = i + 1; j < physicsBodies.length; j++) {
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

    private isGrounded(body: PhysicsBody): boolean {
        const x_dec = getDecimal(body.position.x);
        const y_dec = getDecimal(body.position.y);
        let x_offset = 0;
        let y_offset = 0;
        if (y_dec < 0.95 && y_dec > 0.05) return false;
        if (x_dec >= 0.98) x_offset = 1;
        if (x_dec <= 0.02) x_offset = -1;
        if (y_dec >= 0.95) y_offset = -1;
        if (y_dec <= 0.05) y_offset = 1;

        const leftBlock = this.map.at({
            x: Math.floor(body.position.x) + x_offset,
            y: Math.floor(body.position.y) + y_offset + 1,
        });

        const rightBlock = this.map.at({
            x: Math.ceil(body.position.x) + x_offset,
            y: Math.floor(body.position.y) + y_offset + 1,
        });

        if (x_offset == 0 && rightBlock && this.map.blockType(rightBlock) == BlockType.Block) {
            const rightMods = this.map.blockMods(rightBlock);
            if (!(rightMods && rightMods.includes("air"))) {
                return true;
            }
        }

        if (leftBlock && this.map.blockType(leftBlock) == BlockType.Block) {
            const leftMods = this.map.blockMods(leftBlock);
            if (!(leftMods && leftMods.includes("air"))) {
                return true;
            }
        }
        return false;
    }

    private isTouchingBlock(body: PhysicsBody): boolean {
        const blocks = this.surroundingBlocks(body.position);
        for (const block of blocks) {
            if (intersection(body, block, 1.1)) return true;
        }
        return false;
    }

    private applyNormalForces(body1: PhysicsBody, body2: PhysicsBody, diff: Vector) {
        body1.position.x += Math.max(diff.x * Engine.normalForceRatio / 2, Engine.minimumNormalForce);
        body1.position.y += Math.max(diff.y * Engine.normalForceRatio / 2, Engine.minimumNormalForce);

        body2.position.x += Math.max(-diff.x * Engine.normalForceRatio / 2, Engine.minimumNormalForce);
        body2.position.y += Math.max(-diff.y * Engine.normalForceRatio / 2, Engine.minimumNormalForce);
    }

    private applyNormalForce(body: PhysicsBody, diff: Vector) {
        const x_normal = minimumForce(diff.x * Engine.normalForceRatio, Engine.minimumNormalForce);
        //body.position.x += x_normal;
        const y_normal = minimumForce(diff.y * Engine.normalForceRatio, Engine.minimumNormalForce);
        body.position.y += y_normal;
    }
}

function getDecimal(x: number) {
    return x - Math.floor(x);
}

function minimumForce(force: number, absMin: number) {
    if (Math.abs(force) > absMin) return force;
    return absMin * Math.sign(force);
}

function intersection(body1: PhysicsBody, body2: PhysicsBody, d: number = 1): boolean {
    return (Math.abs(body1.position.x - body2.position.x) < d && Math.abs(body1.position.y - body2.position.y) < d);
}

function clamp(n: number, lo: number, hi: number): number {
    return Math.min(Math.max(n, lo), hi);
}
