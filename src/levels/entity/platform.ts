import { BlockModifier, Vector } from "/src/common/types.ts";
import * as entity from "/src/levels/entity/entity.ts";

export class Entity extends entity.Entity {
    static readonly mods: BlockModifier[] = ["floating"];

    readonly endBound: Vector;

    constructor(block: string, pos: Vector) {
        super(block, pos, Entity.mods);
        this.endBound = {
            x: pos.x + 5,
            y: pos.y,
        };
    }

    tick(delta = 1) {
        if (this.position.x >= this.endBound.x) {
            this.velocity.x = -0.1;
        } else if (this.position.x <= this.initialPosition.x) {
            this.velocity.x = +0.1;
        }

        super.tick(delta);
    }
}
