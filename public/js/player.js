import { createPhysicsObject, defaultMove } from "/public/js/physics.js";
import { app, createSprite } from "/public/js/render.js";
import { Keyboard } from "/public/js/keyboard.js";

function playerMove(delta) {
    if (Keyboard.space) this.velocity.y = -2;
    if (Keyboard.w) this.velocity.y = -2;
    if (Keyboard.d) this.velocity.x = 1;
    if (Keyboard.a) this.velocity.x = -1;
    defaultMove.call(this, delta);
}

export function Player() {
    this.sprite = createPhysicsObject(createSprite("/public/assets/image.png"), true, true);
    this.sprite.move = playerMove;
    app.stage.addChild(this.sprite);
}
