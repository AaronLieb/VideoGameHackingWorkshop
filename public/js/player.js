import { app, createSprite } from "/public/js/render.js";
import { Keyboard } from "/public/js/keyboard.js";
import { SpriteEntity } from "/public/js/spriteEntity.js";

function playerMove(delta) {
    if (Keyboard.space) this.velocity.y = -2;
    if (Keyboard.w) this.velocity.y = -2;
    if (Keyboard.d) this.velocity.x = 1;
    if (Keyboard.a) this.velocity.x = -1;
}

export class Player extends SpriteEntity {
    constructor(level) {
        super(level, "player", { x: 0, y: 0 }, createSprite("/public/assets/image.png"));
    }
}
