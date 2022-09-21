import {
    Block,
    BlockPosition,
    BlockType,
    Command,
    LevelFinishedEvent,
    LevelInfo,
    Millisecond,
    TickDuration,
    Vector,
} from "/src/common/types.ts";
import * as physics from "/src/common/physics.ts";
import * as session from "/src/session.ts";
import * as entity from "/src/levels/entity/entity.ts";
import * as map from "/src/common/map.ts";
import * as ws from "/src/ws.ts";

export interface Info {
    readonly new: (s: session.Session) => Level;
    readonly map: map.LevelMap;
    readonly number: number;
    readonly name: string | undefined;
    readonly desc: string | undefined;
    readonly weight?: number; // default 1.0
    readonly hidden?: boolean;
}

// ConvertToLevelInfo converts an object that implements Info to a LevelInfo
// object.
export function ConvertToLevelInfo(info: Info): LevelInfo {
    return {
        number: info.number,
        name: info.name,
        desc: info.desc,
        weight: info.weight,
    };
}

// Level describes a level with all its server logic.
export class Level {
    protected entities = new Map<Vector, entity.Entity>();
    protected physics: physics.Engine;
    protected player: entity.Entity = entity.Null;
    protected readonly map: map.LevelMap;
    protected readonly number: number;
    protected readonly session: session.Session;

    private wonAt: Millisecond | undefined;
    private tickID: number | undefined;
    private readonly startsAt: Millisecond;

    protected constructor(info: Info, session: session.Session) {
        this.map = info.map;
        this.number = info.number;
        this.session = session;
        this.startsAt = Date.now();
        this.physics = new physics.Engine(this.map);
        this.tickID = setInterval(() => this.tick(), TickDuration);
    }

    destroy() {
        if (this.tickID) {
            clearInterval(this.tickID);
            this.tickID = undefined;
        }
    }

    // initializeEntity initializes all entities with the given block. newFn is
    // called as the entity constructor for each entity.
    protected initializeEntity<T extends entity.Entity>(block: Block, newFn: (pos: Vector) => T): T[] {
        const entities: T[] = [];

        this.map.iterateEntity(block, (pos: Vector, assetID: string) => {
            const ent = newFn(pos);

            this.entities.set(pos, ent);
            entities.push(ent);

            if (assetID == "player") {
                this.player = ent;
            }
        });

        return entities;
    }

    protected addEntity(entity: entity.Entity) {
        this.entities.set(entity.initialPosition, entity);

        const asset = this.map.blockAsset(entity.block, BlockPosition.Floating, BlockType.Entity);
        if (asset == "player") {
            this.player = entity;
        }
    }

    protected sendFinished(cmd: LevelFinishedEvent) {
        this.session.ws.send(cmd);
        this.session;
    }

    get startedAt(): Millisecond {
        return this.startsAt;
    }

    handleCommand(_: ws.Server, cmd: Command) {
        switch (cmd.type) {
            case "MOVE":
                this.player.position = cmd.d.position;
                break;
        }
    }

    tick(deltaTime = 1) {
        const diff = this.physics.tickEntities(this.entities, deltaTime);
        if (diff.length > 0) {
            const data = diff.map((entity) => ({
                initialPosition: entity.initialPosition,
                position: entity.position,
            }));

            this.session.ws.send({
                type: "ENTITY_MOVE",
                d: {
                    level: this.number,
                    entities: data,
                },
            });
        }
    }
}
