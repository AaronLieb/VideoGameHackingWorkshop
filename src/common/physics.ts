import { Entity } from "/src/common/entity.ts";
import { BlockType, VecEq, Vector, ZP } from "/src/common/types.ts";
import { LevelMap } from "/src/common/map.ts";

export class Engine {
    static readonly gravity = 0.040;
    static readonly frictionCoef = -0.150;

    constructor(readonly map: LevelMap, readonly entities: Entity[]) {}

    tick(deltaTime = 1): Entity[] {
        const updates = [];

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

        let grounded = false;
        if (!entity.floating) {
            grounded = this.isGrounded(entity);
            if (grounded) {
                // As long as the entity is skidding along the ground, we want
                // to apply friction so that the object slows down, meaning we
                // decelerate the object.
                //
                // We avoid modifying entity's acceleration here, because we
                // don't actually want to override the entity's acceleration.
                if (entity.velocity.x != 0) {
                    accel.x = entity.velocity.x * Engine.frictionCoef;
                }
                // Don't allow the object to go past the ground.
                entity.velocity.y = 0;
            } else {
                // The object is airbourne. Apply acceleration downwards so that
                // it falls to the ground.
                accel.y = Engine.gravity;
            }
        }

        entity.velocity.x += (entity.acceleration.x + accel.x) * deltaTime;
        entity.velocity.y += (entity.acceleration.y + accel.y) * deltaTime;

        entity.position.x += entity.velocity.x * deltaTime;
        entity.position.y += entity.velocity.y * deltaTime;

        entity.position.x = clamp(entity.position.x, 0, this.map.width);
        entity.position.y = clamp(entity.position.y, 0, this.map.height);

        // TODO: write collision logic here.
        // TOOD: remove isGrounded logic, since we'd already be checking entity
        // collision with the ground.
    }

    isGrounded(entity: Entity): boolean {
        const lEdge = this.positionIsGround({
            x: Math.floor(entity.position.x) + 0,
            y: Math.floor(entity.position.y) + 1,
        });
        const rEdge = this.positionIsGround({
            x: Math.floor(entity.position.x) + 1,
            y: Math.floor(entity.position.y) + 1,
        });
        return lEdge || rEdge;
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

function clamp(n: number, lo: number, hi: number): number {
    return Math.min(Math.max(n, lo), hi);
}
