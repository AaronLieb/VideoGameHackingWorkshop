import { Entity } from "/src/common/entity.ts";
import { Block, BlockType, VecEq, Vector, ZP } from "/src/common/types.ts";
import { LevelMap } from "/src/common/map.ts";

type PhysicsBlock = { position: Vector; block: Block };
type PhysicsBody = Entity | PhysicsBlock;

type Origin = "client" | "server";

export class Engine {
    static readonly gravity = 0.040;
    static readonly frictionCoef = -0.150;

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

    public resolver(body1: PhysicsBody, body2: PhysicsBody) {
      // only move entities trying to get into blocked areas (edges)
      // if an entity somehow makes it inside a blocked area, let them move freely
    }

    public detector(): PhysicsBody[][] {
        return (this.origin == "server") ? this.serverDetector() : this.clientDetector();
    }

    private serverDetector(): PhysicsBody[][] {
        const bodies: PhysicsBody[] = [];
        this.entities.forEach((e: Entity) => bodies.push(e));
        //TODO: Make this look for all surroundingBlocks near each entity, only unique blocks
        this.surroundingBlocks(this.player.position).forEach((e: PhysicsBlock) => bodies.push(e));
        return this.getCollisionPairs(bodies, (body1: PhysicsBody, body2: PhysicsBody): boolean => {
            return body1.block != "P" && body2.block == "P";
        });
    }

    private clientDetector(): PhysicsBody[][] {
        const bodies: PhysicsBody[] = [];
        bodies.push(this.player);
        this.entities.forEach((e: Entity) => bodies.push(e));
        this.surroundingBlocks(this.player.position).forEach((e: PhysicsBlock) => bodies.push(e));
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

    private surroundingBlocks(pos: Vector): PhysicsBlock[] {
        const blocks: PhysicsBlock[] = [];

        for (let x = Math.floor(pos.x - 1); x <= Math.ceil(pos.x + 1); x++) {
            for (let y = Math.floor(pos.y - 1); y <= Math.ceil(pos.y + 1); y++) {
                const block = this.map.at({ x, y });
                if (!block) {
                    continue;
                }

                const mods = this.map.blockMods(block);
                if (mods && mods.includes("air")) {
                    continue;
                }

                blocks.push({ position: { x, y }, block });
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
}

function intersection(body1: PhysicsBody, body2: PhysicsBody): boolean {
    return (Math.abs(body1.position.x - body2.position.x) < 1 && Math.abs(body1.position.y - body2.position.y) < 1);
}

function clamp(n: number, lo: number, hi: number): number {
    return Math.min(Math.max(n, lo), hi);
}
