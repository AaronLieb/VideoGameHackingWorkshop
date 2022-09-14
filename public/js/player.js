import { Keyboard } from "/public/js/keyboard.js";
import { SpriteEntity, SpriteFromAsset } from "/public/js/spriteEntity.js";

function playerMove(delta) {
    if (Keyboard.space) this.velocity.y = -2;
    if (Keyboard.w) this.velocity.y = -2;
    if (Keyboard.d) this.velocity.x = 1;
    if (Keyboard.a) this.velocity.x = -1;
}

const playerAssets = [
    "player1",
    "player2",
    "player3",
    "player4",
];

export class Player extends SpriteEntity {
    constructor(block, pos) {
        super(block, pos, SpriteFromAsset(playerAssets[0]));
    }
}
