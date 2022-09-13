import { Block, Command, LevelFinishedEvent, Millisecond, TickDuration, Vector } from "/src/common/types.ts";
import * as entity from "/src/common/entity.ts";
import * as map from "/src/common/map.ts";
import * as ws from "/src/ws.ts";

export interface Session {
    setScore(level: number, time: number): Promise<void>;
}

// Level describes a level with all its server logic.
export class Level {
    // These actually do nothing. They're supposed to be overridden by the
    // children class. You have to do that. Also, none of these are accessible
    // internally.
    static readonly map: map.LevelMap;
    static readonly number: number;
    static readonly levelName: string | undefined;
    static readonly levelDesc: string | undefined;

    protected entities = new Map<Vector, entity.Entity>();
    protected map: map.LevelMap | undefined;

    private ws: ws.Server = ws.Noop;
    private wonAt: Millisecond | undefined;
    private startsAt: Millisecond;
    private tickID: number | undefined;

    constructor(readonly session: Session) {
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
    protected initializeEntity(block: Block, newFn: (pos: Vector) => entity.Entity) {
        this.map?.iterateEntity(block, (pos: Vector) => {
            this.entities.set(pos, newFn(pos));
        });
    }

    protected sendFinished(cmd: LevelFinishedEvent) {
        this.ws.send(cmd);
        this.session;
    }

    get startedAt(): Millisecond {
        return this.startsAt;
    }

    handleCommand(server: ws.Server, cmd: Command) {
        switch (cmd.type) {
            case "_open":
                this.startsAt = Date.now();
                this.ws = server;
                break;
            case "_close":
                this.ws = ws.Noop;
                break;
        }
    }

    tick() {}
}
