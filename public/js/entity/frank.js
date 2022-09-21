import { SpriteEntity, SpriteFromAsset } from "/public/js/entity/spriteEntity.js";
import { BlockSize } from "/public/js/common/types.js";

export class RainingFrank extends SpriteEntity {
    speed;
    angle;
    angleSpeed;
    game;
    gone;

    constructor(game) {
        const pos = {
            x: (Math.random() * (game.width - 2)) + 1,
            y: 0,
        };
        super("\x00", pos, SpriteFromAsset("frank"));
        console.log("it's raining franks!", pos);

        this.sprite.angle = Math.random() * 360;
        this.sprite.pivot.x = BlockSize / 2;
        this.sprite.pivot.y = BlockSize / 2;

        this.speed = 0.15 + Math.random() * 0.15;
        this.angleSpeed = Math.random() * 45;

        this.game = game;
    }

    tick(delta) {
        if (this.gone) {
            return;
        }

        super.tick(delta);
        this.position = {
            x: this.position.x,
            y: this.position.y + this.speed * delta,
        };

        this.sprite.angle += this.angleSpeed;

        if (this.position.y > this.game.height + BlockSize) {
            this.gone = true;
        }
    }
}
