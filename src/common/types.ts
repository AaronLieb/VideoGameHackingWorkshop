// Millisecond duration type.
export type Millisecond = number;

export const TickRate = 15;
export const TickDuration: Millisecond = 1000 / TickRate;

// Position is a pair of coordinates.
export type Position = {
    x: number;
    y: number;
};

// Velocity is a 2D vector of velocity.
export type Velocity = {
    x: number;
    y: number;
};

// Block describes a single character in a map that corresponds to the
// declared objects in its metadata.
//
// All blanks or space characters will be of the "background" block. Map
// metadata must have this block defined.
export type Block = string | "background";

// BlockType is an enum that describes a block type, which is determined by
// whether the object ID is under metadata.blocks or metadata.entities.
export enum BlockType {
    Block,
    EntityBlock,
}

// BlockModifier is any modifier that a block can have within a map.
export type BlockModifier =
    | undefined
    // air lets the player pass through the block. Block "background"
    // automatically have this modifier.
    | "air";

// MapObjectID is the ID of an object. Objects are global, meaning all maps
// share the same set of objects.
export type MapObjectID = string;

// RawMap is the entire map described as an array of map lines. The length of
// this array is guaranteed to be equal to the height in the metadata.
export type RawMap = string;

// MapMetadata is the metadata of a map.
export type MapMetadata = {
    blocks: Record<Block, MapObjectID>;
    entities: Record<Block, MapObjectID>;
    blockMods?: Record<Block, BlockModifier[]>;
    goals: MapGoal[];
    attributes: Record<string, unknown>;
};

// MapGoal describes the bounds of a goal in a map. When a player is within the
// goal, then they win the level.
export type MapGoal = {
    from: Position;
    to: Position;
};

// MapObjects is the global registry of object IDs to its assets.
export type MapObjects = {
    assets: Record<MapObjectID, AssetPath>;
};

// AssetPath is a path to an asset.
export type AssetPath = string;

export type Username = string;

// Leaderboards describes a leaderboard type. It contains the leaderboards of
// all levels.
export type Leaderboards = Record<number, Score[]>;

// Score is a single leaderboard entry for a player.
export type Score = {
    username: string;
    time: Millisecond;
};

// Event is a union of all Websocket payload types that the server can send to
// the client.
export type Event =
    | HelloEvent
    | WarningEvent
    | MapDataEvent
    | VictoryEvent
    | CorrectionEvent;

// HelloEvent is the first ever event coming from the server. Contains all the
// data needed.
export type HelloEvent = {
    readonly type: "HELLO";
    d: {
        nLevels: number;
        completedLevels: number[];
    };
};

// WarningEvent is a non-fatal event sent by the server for whatever reason.
export type WarningEvent = {
    readonly type: "WARNING";
    d: {
        message: string;
    };
};

// MapDataEvent returns the data of the map requested using the `JOIN` command.
// The server is permitted to send MAP_DATA even when the client hasn't
// requested it, and the client should handle that.
export type MapDataEvent = {
    readonly type: "MAP_DATA";
    d: {
        level: number;
        map: RawMap;
        metadata: MapMetadata;
    };
};

// VictoryEvent is sent when the player wins a game.
export type VictoryEvent = {
    readonly type: "VICTORY";
    d: {
        level: number;
        time: number; // millisecond
    };
};

// CorrectionEvent requests the client to correct the player's position. If the
// client does not follow that, then the server is allowed to terminate the
// client's connection.
export type CorrectionEvent = {
    readonly type: "CORRECTION";
    d: {
        position?: Position;
        velocity?: Velocity;
    };
};

// Command is a union of all Websocket payload types that the client can send to
// the server.
export type Command =
    | JoinCommand
    | MoveCommand
    | { type: "_open" }
    | { type: "_close"; code: number };

// JoinCommand requests to the server that the client is joining a new map. The
// server must eventually respond with the following events:
//
//    - MAP_DATA
//
export type JoinCommand = {
    readonly type: "JOIN";
    d: {
        // level is the level that the client wants to join.
        level: number;
    };
};

// MoveCommand is the command to be sent on every movement. The client should
// send this command as often as it needs to, which could be on every movement
// or every duration (such as 16.67ms or 60Hz).
export type MoveCommand = {
    readonly type: "MOVE";
    d: {
        position: Position;
    };
};
