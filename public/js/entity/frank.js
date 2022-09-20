import { SpriteEntity, SpriteFromAsset } from "/public/js/entity/spriteEntity.js";

export class RainingFrank extends SpriteEntity {
    static speed = 0.15;
    gameHeight;
    gone;

    constructor(gameWidth, gameHeight) {
        const pos = {
            x: (Math.random() * (gameWidth - 2)) + 1,
            y: 0,
        };
        console.log("it's raining franks!", pos);
        super("\x00", pos, SpriteFromAsset("frank"));
        this.gameHeight = gameHeight;
    }

    tick(delta) {
        if (this.gone) {
            return;
        }

        super.tick(delta);
        this.position = {
            x: this.position.x,
            y: this.position.y + RainingFrank.speed * delta,
        };

        if (this.position.y > this.gameHeight) {
            this.gone = true;
        }
    }
}
