import { Block, BlockModifier, Vector } from "/src/common/types.ts";

export abstract class Entity {
    abstract readonly mods: BlockModifier[];
    abstract readonly block: Block;
    abstract readonly initialPosition: Vector;

    abstract position: Vector;
    abstract velocity: Vector;
    abstract acceleration: Vector;

    private isFloating: boolean | undefined;

    get floating(): boolean {
        if (this.isFloating === undefined) {
            this.isFloating = this.mods.includes("floating");
        }
        return this.isFloating;
    }

    // tick is called on every engine tick. The entity should update itself.
    tick(_delta: number) {}
}
