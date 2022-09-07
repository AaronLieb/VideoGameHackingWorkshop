export class Entity {
    constructor(block, pos) {
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
    constructor(block, pos) {
        super(block, pos);
    }
}
