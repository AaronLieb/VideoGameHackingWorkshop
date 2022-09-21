import { Entity } from "/public/js/entity/entity.js";
import * as physics from "/public/js/common/physics.js";
import * as input from "/public/js/input.js";

const playerAssets = [
    "player1",
    "player2",
    "player3",
    "player4",
];

export class Player extends Entity {
    static walkSpeed = 0.25;
    static walkAccel = 0.035;

    static jumpHeight = 0.45;
    static jumpAccel = 0.10;

    jumpFactor = 0;

    constructor(block, pos) {
        super(block, pos, playerAssets[0], ["player"]);
    }

    tick(delta) {
        super.tick(delta);
        this.#handleMove();
    }

    #handleMove() {
        // TODO: use a proper jump curve
        if (input.ActionKeys.up) {
            // When I go up, the velocity is actually negative, because the
            // origin is at the top-left corner.
            if (this.velocity.y > -Player.jumpHeight) {
                this.acceleration.y = -Player.jumpAccel;
            } else {
                this.acceleration.y = 0;
            }
        } else {
            this.acceleration.y = 0;
        }

        switch (true) {
            case input.ActionKeys.right: {
                if (this.velocity.x < Player.walkSpeed) {
                    this.acceleration.x = Player.walkAccel;
                } else {
                    this.acceleration.x = 0;
                }
                break;
            }
            case input.ActionKeys.left: {
                if (this.velocity.x > -Player.walkSpeed) {
                    this.acceleration.x = -Player.walkAccel;
                } else {
                    this.acceleration.x = 0;
                }
                break;
            }
            default: {
                this.acceleration.x = 0;
                break;
            }
        }
    }
}
