import { Entity } from "/src/common/entity.ts";
import { BlockModifier, Vector } from "/src/common/types.ts";
import { Map } from "/src/common/map.ts";

export const GRAVITY = 0.3;

export class Engine {
    readonly GRAVITY: number = 0.3;

    tickEntity(entity: Entity, map: Map, deltaTime: number) {
        const isGrounded = this.checkGrounded(entity, map);
        if (isGrounded) {
            entity.velocity.y = 0;
            entity.acceleration.y = 0;
        }
        entity.velocity.x += entity.acceleration.x * deltaTime;
        entity.velocity.y += entity.acceleration.y * deltaTime;
        entity.position.x += entity.velocity.x * deltaTime;
        entity.position.y += entity.velocity.y * deltaTime;
        entity.tick();
    }

    checkGrounded(entity: Entity, map: Map) {
        let isGrounded = false;
        map.iterate((pos: Vector, _, __, mods: BlockModifier[]) => {
            if (!mods.includes("air") && pos.y - entity.position.y < 1) {
                isGrounded = true;
                return;
            }
        });
        return isGrounded;
    }
}
