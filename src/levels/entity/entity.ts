import * as entity from "/src/common/entity.ts";
import { Block, Vector, ZP } from "/src/common/types.ts";

export class Entity implements entity.Entity {
    readonly block: Block;
    readonly initialPosition: Vector;

    position: Vector;
    velocity: Vector;
    acceleration: Vector;

    constructor(block: Block, pos: Vector) {
        this.block = block;
        this.initialPosition = { ...pos }; // copy to avoid mutation

        this.velocity = ZP();
        this.acceleration = ZP();
        this.position = pos;
    }

    tick(_deltaTime = 1) {}
}

// Null is the null entity. It is rendered off-screen and is invisible to the
// user. Use it as a sane fallback instead of null or undefined. DO NOT MODIFY
// ITS PROPERTIES.
export const Null = new Entity(" ", { x: -1, y: -1 });
