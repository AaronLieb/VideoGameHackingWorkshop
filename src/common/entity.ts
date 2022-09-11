import { Block, Position, Velocity } from "/src/common/types.ts";

export class Entity {
    readonly block: Block;
    readonly initialPosition: Position;

    position: Position;
    velocity: Velocity;

    constructor(block: Block, pos: Position) {
        this.block = block;
        this.position = pos;
        this.velocity = { x: 0, y: 0 };
        this.initialPosition = pos;
    }

    tick() {}
}

// Player is a player entity.
export class Player extends Entity {
    constructor(block: Block, pos: Position) {
        super(block, pos);
    }
}
