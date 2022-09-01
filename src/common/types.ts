export type Position = {
    x: number;
    y: number;
};

export type Velocity = {
    x: number;
    y: number;
};

export type MapData = {/* TODO */};
export type MapMetadata = {/* TODO */};

// Event is a union of all Websocket payload types that the server can send to
// the client.
export type Event =
    | HelloEvent
    | WarningEvent
    | MapDataEvent
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
        map: MapData;
        metadata: MapMetadata;
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
export type Command = JoinCommand | MoveCommand;

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
        position?: Position;
        velocity?: Velocity;
    };
};
