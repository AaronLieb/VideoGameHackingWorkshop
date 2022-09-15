// Millisecond duration type.
export type Millisecond = number;

export const TickRate = 30;
export const TickDuration: Millisecond = 1000 / TickRate;

// UnixMilli is the Unix timestamp in milliseconds.
export type UnixMilli = number;

// Vector is used for position, velocity, acceleration. It contains an x and a y
// value.
export type Vector = {
    x: number;
    y: number;
};

// Block describes a single character in a map that corresponds to the
// declared objects in its metadata.
export type Block = string | " ";

// BlockSize is the size of one block in pixels. One unit of Position in either
// axis will equal to one block, which should be 32 pixels. The pixels do not
// have to correspond to physical pixels, but all textures should be mapped to
// be about 1:1 and treated as a 32x32 texture.
export const BlockSize = 32;

// BlockPosition forms all the possible positions of a block within itself.
//
// To demonstrate its purposes, here's how it works. Suppose we have the
// following map:
//
//    LLLLLLLL
//    LLLLLLLL
//    LLLLLLLL
//
// We can deduce from this object that some of these blocks are outside, meaning
// their neighbors are not the same block, while the other blocks all have their
// neighbors be the same block. By checking what the neighbor blocks are and in
// what direction, we can deduce the positions of these blocks.
//
// Once we have the position of these blocks, we can map them to different kinds
// of textures (see BlockTextures). This allows designers to naturally design
// maps without necessarily having to design tileable edge textures or have
// different block characters for the same object.
//
// As a side note, if the edge of the block is the map boundary, then it can be
// considered that the block is extending beyond that. For example, if we have
// an L block touching the left boundary, then it is counted as a Middle block,
// not a Left block.
//
// A block with no neighbor is considered floating.
//
// Below is a diagram to help visualize these positions:
//
//                 +----------+
//                 | Floating |
//                 +----------+
//
//   +---------------------------------------+
//   | Top|Left        Top         Top|Right |
//   |                                       |
//   | Left           Middle           Right |
//   |                                       |
//   | Bottom|Left    Bottom    Bottom|Right |
//   +---------------------------------------+
//
export enum BlockPosition {
    Floating = 0, // no neighbor
    Top = 1 << 0,
    Bottom = 1 << 1,
    Left = 1 << 2,
    Right = 1 << 3,
    Middle = Top | Bottom | Left | Right,

    TopLeft = Top | Left,
    TopRight = Top | Right,
    BottomLeft = Bottom | Left,
    BottomRight = Bottom | Right,
}

// BlockEdges contains edge positions.
export const BlockEdges: BlockPosition[] = [
    BlockPosition.Top,
    BlockPosition.Bottom,
    BlockPosition.Left,
    BlockPosition.Right,
];

// BlockTextures maps each block position to the object ID.
export type BlockTextures = {
    [key in BlockPosition]: AssetID;
};

// BlockType is an enum that describes a block type, which is determined by
// whether the object ID is under metadata.blocks or metadata.entities.
export enum BlockType {
    Block,
    Entity,
}

// BlockModifier is any modifier that a block can have within a map.
export type BlockModifier =
    // air lets the player pass through the block. Block " " automatically have
    // this modifier.
    | "air"
    // goal turns all regions of the block into one goal. Use this in
    // combination with air or the player won't be able to hit the goal.
    | "goal"
    // fixed forces the renderer to render this object at a fixed position by
    // stretching the texture into the regions covered by 32x32 blocks.
    | "fixed";

// RawMap is the entire map described as an array of map lines. The length of
// this array is guaranteed to be equal to the height in the metadata.
export type RawMap = string;

// MapMetadata is the metadata of a map.
export type MapMetadata = {
    blocks: Record<Block, AssetID | BlockTextures>;
    entities: Record<Block, AssetID>;
    blockMods: Record<Block, BlockModifier[]>;
    attributes?: Record<string, unknown>;
    backgrounds?: MapBackground[];
};

// MapBackground describes a map's background layer.
export type MapBackground = {
    asset: string;
    mode: "tiled" | "stretched" | "fixed";
};

// AssetID is the ID of an asset. Assets are global, meaning all maps share the
// same set of assets.
export type AssetID = string | "player";

// AssetPath is a path to an asset.
export type AssetPath = string;

// Event is a union of all Websocket payload types that the server can send to
// the client.
export type Event =
    | HelloEvent
    | WarningEvent
    | LevelJoinedEvent
    | LevelFinishedEvent
    | PersonalScoresEvent
    | LeaderboardUpdateEvent
    | EntityMoveEvent
    | { type: "_open" }
    | { type: "_close"; code: number };

// LevelInfo is the info for each level.
export type LevelInfo = {
    number: number;
    name?: string;
    desc?: string;
};

// HelloEvent is the first ever event coming from the server. Contains all the
// data needed.
export type HelloEvent = {
    readonly type: "HELLO";
    d: {
        username: string;
        // levels contains the list of level numbers. The client is expected to
        // filter out levels that are not in this list.
        levels: LevelInfo[];
    };
};

// WarningEvent is a non-fatal event sent by the server for whatever reason.
export type WarningEvent = {
    readonly type: "WARNING";
    d: {
        message: string;
    };
};

// LevelJoinedEvent is sent when the server has acknowledged a JoinCommand.
export type LevelJoinedEvent = {
    readonly type: "LEVEL_JOINED";
    d: {
        level: number;
        info: LevelInfo;
        raw: RawMap;
        metadata: MapMetadata;
    };
};

// LevelFinishedEvent is sent when the player finishes a level.
export type LevelFinishedEvent = {
    readonly type: "LEVEL_FINISHED";
    d: {
        level: number;
        won: boolean;
        time: Millisecond;
    };
};

// PersonalScoresEvent is usually emitted after HELLO and throughout the
// session. It is used to update (and replace) existing high scores of the
// current player.
export type PersonalScoresEvent = {
    readonly type: "PERSONAL_SCORES";
    d: PersonalScore[];
};

// PersonalScore is a score entry for the current user. It keeps track of the
// best time for a level.
export type PersonalScore = {
    level: number;
    your_best: Millisecond; // your best time
    global_best: Millisecond; // other people's best time
};

// LoaderboardUpdateEvent is emitted throughout the Websocket session when a new
// player has obtained a new high score. The client is expected to replace the
// score of whatever is present in the Leaderboards.
export type LeaderboardUpdateEvent = {
    readonly type: "LEADERBOARD_UPDATE";
    d: Leaderboards;
};

// Leaderboards describes a leaderboard type. It contains the leaderboards of
// all players.
export type Leaderboards = LevelLeaderboard[];

// LevelLeaderboard is the leaderboard of a single level.
export type LevelLeaderboard = {
    level: number;
    scores: LevelScore[];
};

// LevelLeaderboardScore is a single high score entry inside a leaderboard.
export type LevelScore = {
    username: string;
    bestTime: Millisecond;
};

// EntityPositionData describes a position of an entity. The entity is
// identified by its initial position on the map.
export type EntityPositionData = {
    // initialPosition is the entity's initial position on the map. Refer to
    // map.Map's methods for additional helpers.
    readonly initialPosition: Vector;
    // position is the new position of the entity.
    position: Vector;
};

// EntityMoveEvent is an event that's sent by the server on potentially every
// tick. The server may or may not send the event if there's nothing to be
// updated.
//
// The client is advised to linear-interpolate (lerp) the entities when it
// receives the event. This prevents entities from jittering on the screen.
export type EntityMoveEvent = {
    readonly type: "ENTITY_MOVE";
    d: {
        level: number;
        entities: EntityPositionData[];
    };
};

// Command is a union of all Websocket payload types that the client can send to
// the server.
export type Command =
    | JoinCommand
    | MoveCommand
    | { type: "_open" }
    | { type: "_close"; code: number };

// JoinCommand requests to the server that the client is joining a new map.
export type JoinCommand = {
    readonly type: "JOIN";
    d: {
        // level is the level that the client wants to join.
        level: number;
    };
};

// MoveCommand is the command to be sent on every player movement. The client
// should send this command as often as it needs to, which could be on every
// movement or every duration (such as 16.67ms or 60Hz). However, the server may
// not process the movement until it ticks, which is every TickDuration defined
// above.
//
// It is also worth noting that the client can ONLY directly control the
// player's movement, and that will be the only entity that it can directly
// control. Other entities are controlled by the server and will be calculated
// appropriately. As such, there's no need for this command to describe movement
// of any other entity than the player.
export type MoveCommand = {
    readonly type: "MOVE";
    d: {
        position: Vector;
    };
};
