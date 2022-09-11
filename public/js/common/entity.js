// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

class Entity {
    block;
    initialPosition;
    position;
    velocity;
    constructor(block, pos){
        this.block = block;
        this.position = pos;
        this.velocity = {
            x: 0,
            y: 0
        };
        this.initialPosition = pos;
    }
    tick() {}
}
class Player extends Entity {
    constructor(block, pos){
        super(block, pos);
    }
}
export { Entity as Entity };
export { Player as Player };
