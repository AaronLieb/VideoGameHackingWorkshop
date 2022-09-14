import { Entity } from "/public/js/common/entity.js";
import { app } from "/public/js/render.js";
import { BlockSize } from "/public/js/common/types.js";

export class SpriteEntity extends Entity {
    constructor(level, block, initialPos, sprite) {
        super(block, initialPos);
        this.position = initialPos;
        this.sprite = sprite;
        Object.defineProperty(this.sprite, "position", {
            get() {
                return this.position;
            },
            set(pos) {
                this.position = pos;
            }
        });
        this.sprite.x = initialPos.x * BlockSize;
        this.sprite.y = initialPos.y * BlockSize;
        app.stage.addChild(this.sprite);
        level.entities.push(this);
        level.sprites.push(this);
    }
}
