import { Block, BlockModifier, EntityPositionData, Vector } from "/src/common/types.ts";

export abstract class Entity {
    abstract readonly mods: BlockModifier[];
    abstract readonly block: Block;
    abstract readonly initialPosition: Vector;
    abstract readonly isStatic: boolean;

    abstract updated: boolean;
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

    get positionData(): EntityPositionData {
        return {
            initialPosition: this.initialPosition,
            // Support the client-side entity implementation getters.
            position: { x: this.position.x, y: this.position.y },
            velocity: { x: this.velocity.x, y: this.velocity.y },
        };
    }

    // tick is called on every engine tick. The entity should update itself.
    tick(_delta: number) {}
}
