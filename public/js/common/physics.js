export const GRAVITY = 0.3;
export class Engine {
    constructor() {
        this.GRAVITY = 0.3;
    }
    tickEntity(entity, map, deltaTime) {
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
    checkGrounded(entity, map) {
        let isGrounded = false;
        map.iterate((pos, _, __, mods) => {
            if (!mods.includes("air") && pos.y - entity.position.y < 1) {
                isGrounded = true;
                return;
            }
        });
        return isGrounded;
    }
}
