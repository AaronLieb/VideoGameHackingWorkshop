import { Entity } from "/src/common/entity.ts";
import { BlockType, Vector } from "/src/common/types.ts";
import { LevelMap } from "/src/common/map.ts";

export class Engine {
    readonly gravity = 0.3;

    constructor(readonly map: LevelMap) {}

    tickEntities(entities: Map<Vector, Entity>, deltaTime = 0): Entity[] {
        const updates = [];

        for (const [_, entity] of entities) {
            const pos = { ...entity.position }; // copy so tickEntity can mutate
            this.tickEntity(entity, deltaTime);
            if (pos.x != entity.position.x || pos.y != entity.position.y) {
                updates.push(entity);
            }
        }

        return updates;
    }

    tickEntity(entity: Entity, deltaTime = 1) {
        const isGrounded = this.isGrounded(entity);
        if (isGrounded) {
            entity.velocity.y = 0;
            entity.acceleration.y = 0;
        }

        entity.velocity.x += entity.acceleration.x * deltaTime;
        entity.velocity.y += entity.acceleration.y * deltaTime;

        entity.tick(deltaTime);

        entity.position.x += entity.velocity.x * deltaTime;
        entity.position.y += entity.velocity.y * deltaTime;
    }

    isGrounded(entity: Entity): boolean {
        return false ||
            this.positionIsGround({ x: Math.ceil(entity.position.x), y: Math.ceil(entity.position.y) }) ||
            this.positionIsGround({ x: Math.ceil(entity.position.x), y: Math.ceil(entity.position.y) - 1 });
    }

    private positionIsGround(pos: Vector): boolean {
        const block = this.map.at(pos);
        if (!block) {
            return false;
        }

        const btype = this.map.blockType(block);
        if (!btype || btype == BlockType.Entity) {
            return false;
        }

        const mods = this.map.blockMods(block);
        if (mods.includes("air")) {
            return false;
        }

        return true;
    }
}
