import { BlockSize } from "/public/js/common/types.js";
import { Entity } from "/public/js/entity/entity.js";
import * as input from "/public/js/input.js";

const playerAssets = [
    "player1",
    "player2",
    "player3",
    "player4",
];

export class Player extends Entity {
    constructor(block, pos) {
        super(block, pos, playerAssets[0], ["player"]);
    }

    tick(delta) {
        super.tick(delta);
        this.#handleMove(delta);
    }

    #handleMove(delta) {
        if (input.ActionKeys.up) this.velocity.y = -2 * BlockSize * delta;
        if (input.ActionKeys.left) this.velocity.x = -1 * BlockSize * delta;
        if (input.ActionKeys.right) this.velocity.x = 1 * BlockSize * delta;
    }
}
