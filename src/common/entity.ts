import { Block, Vector } from "/src/common/types.ts";

export interface Entity {
    readonly block: Block;
    readonly initialPosition: Vector;

    position: Vector;
    velocity: Vector;
    acceleration: Vector;

    // tick is called on every engine tick. The entity should update itself.
    tick(delta: number): void;
}
