import { Position } from "/src/common/types.ts";
import * as level1 from "/src/common/levels/01.ts";
import * as entity from "/src/common/entity.ts";
import * as level from "/src/level.ts";

export * from "/src/common/levels/01.ts";

export class Level extends level.Level {
    constructor(s: level.Session) {
        super(s, level1.Map, 1);
        this.initializeEntity("P", (pos: Position) => new entity.Player("P", pos));
        this.initializeEntity("B", (pos: Position) => new entity.PhysicsEntity("B", pos, 0.5));
    }
}
