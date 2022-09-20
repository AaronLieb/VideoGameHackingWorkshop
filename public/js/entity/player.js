import { BlockSize } from "/public/js/common/types.js";
import { SpriteEntity, SpriteFromAsset } from "/public/js/entity/spriteEntity.js";
import * as input from "/public/js/input.js";

function playerMove(delta) {
    if (input.ActionKeys.jump) this.velocity.y = -2 * BlockSize;
    if (input.ActionKeys.up) this.velocity.y = -2 * BlockSize;
    if (input.ActionKeys.left) this.velocity.x = -1 * BlockSize;
    if (input.ActionKeys.right) this.velocity.x = 1 * BlockSize;
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
