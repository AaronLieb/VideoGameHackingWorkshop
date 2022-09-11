import { Block, Command, Position, TickDuration } from "/src/common/types.ts";
import * as entity from "/src/common/entity.ts";
import * as map from "/src/common/map.ts";
import * as ws from "/src/ws.ts";

export interface Session {
    setScore(level: number, time: number): Promise<void>;
}

// Level describes a level with all its server logic.
export class Level {
    readonly map: map.Map;
    readonly level: number;
    readonly startsAt: number;
    readonly session: Session;

    entities = new Map<Position, entity.Entity>();

    private wonAt: number | undefined;
    private tickID: number | undefined;

    constructor(s: Session, map: map.Map, level: number) {
        this.map = map;
        this.level = level;
        this.session = s;
        this.startsAt = Date.now();
        this.tickID = setInterval(this.tick, TickDuration);
    }

    destroy() {
        if (this.tickID) {
            clearInterval(this.tickID);
            this.tickID = undefined;
        }
    }

    // initializeEntity initializes all entities with the given block. newFn is
    // called as the entity constructor for each entity.
    initializeEntity(block: Block, newFn: (pos: Position) => entity.Entity) {
        this.map.iterateEntity(block, (pos: Position) => {
            this.entities.set(pos, newFn(pos));
        });
    }

    handleCommand(_server: ws.Server, _cmd: Command) {}

    tick() {}
}
