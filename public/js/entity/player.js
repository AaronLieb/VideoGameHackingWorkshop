import { PIXI } from "/public/js/deps.js";
import { Entity, TextureFromAsset } from "/public/js/entity/entity.js";
import * as input from "/public/js/input.js";

const playerAssets = [
    "player1",
    "player2",
    "player3",
    "player4",
];

const playerTextures = playerAssets.map((assetID) => TextureFromAsset(assetID));

export class Player extends Entity {
    static walkSpeed = 0.25;
    static walkAccel = 0.035;

    static jumpHeight = 0.45;
    static jumpAccel = 0.5;

    static spriteCycleDelay = 6;
    #spriteDelay = 0;
    #spriteIndex = 0;

    constructor(block, pos) {
        super(block, pos, playerAssets[0], ["player"]);
    }

    tick(delta) {
        super.tick(delta);
        this.#handleMove();
    }

    #nextTexture(moving = false) {
        if (moving) {
            if (this.#spriteDelay == 0) {
                this.#spriteIndex = (this.#spriteIndex + 1) % playerTextures.length;
            }
            this.#spriteDelay = (this.#spriteDelay + 1) % Player.spriteCycleDelay;
        } else if (this.#spriteIndex != 0) {
            this.#spriteIndex = 0;
            this.#spriteDelay = 0;
        }
        return playerTextures[this.#spriteIndex];
    }

    #handleMove() {
        if (input.ActionKeys.up) {
            // When I go up, the velocity is actually negative, because the
            // origin is at the top-left corner.
            this.velocity.y = -Player.jumpAccel;
            // change this later, just for testing
            input.ActionKeys.up = false;
        }

        switch (true) {
            case input.ActionKeys.right: {
                if (this.velocity.x < Player.walkSpeed) {
                    this.acceleration.x = Player.walkAccel;
                } else {
                    this.acceleration.x = 0;
                }
                this.flipX(false);
                this.sprite.texture = this.#nextTexture(true);
                break;
            }
            case input.ActionKeys.left: {
                if (this.velocity.x > -Player.walkSpeed) {
                    this.acceleration.x = -Player.walkAccel;
                } else {
                    this.acceleration.x = 0;
                }
                this.flipX(true);
                this.sprite.texture = this.#nextTexture(true);
                break;
            }
            default: {
                this.acceleration.x = 0;
                this.sprite.texture = this.#nextTexture(false);
                break;
            }
        }
    }
}
