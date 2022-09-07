import { Block, Vector } from "/src/common/types.ts";

export class Entity {
    readonly block: Block;
    readonly initialPosition: Vector;

    position: Vector;
    velocity: Vector;
    acceleration: Vector;

    constructor(block: Block, pos: Vector) {
        this.block = block;
        this.position = pos;
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.initialPosition = pos;
    }

    tick() {}
}

// Player is a player entity.
export class Player extends Entity {
    constructor(block: Block, pos: Vector) {
        super(block, pos);
    }
}
