import { createPoint } from "/public/js/helpers.js";

const GRAVITY = 0.3;

let sprites = [];

export function defaultMove(delta) {
    if (this.isGrounded) {
        this.velocity.y = 0;
    }

    this.velocity.x += this.acceleration.x * delta;
    this.velocity.y += this.acceleration.y * delta;
    this.x += this.velocity.x * delta;
    this.y += this.velocity.y * delta;
}

export const createPhysicsObject = (sprite, isMoveable, hasGravity) => {
    sprite.isMoveable = isMoveable;
    sprite.hasGravity = hasGravity;
    sprite.isGrounded = false;
    sprite.velocity = createPoint(0, 0);
    sprite.acceleration = createPoint(0, (hasGravity) ? GRAVITY : 0);
    sprite.move = defaultMove;
    sprites.push(sprite);
    return sprite;
};

export const physicsLoop = (delta) => {
    for (const sprite of sprites) {
        if (sprite.isMoveable) sprite.move(delta);
    }
};
