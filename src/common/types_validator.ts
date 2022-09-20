// Code generated by generate_validator.js. DO NOT EDIT.
//
// deno-lint-ignore-file
import * as t from "./types.ts";

// ValidationError is thrown on every error returned by validateX
// functions.
export class ValidationError extends Error {}

// validateVector validates the needed type constraints
// from v and cast it to Vector.
export function validateVector(v: any): t.Vector {
    if (typeof v.x !== "number") throw new ValidationError("missing v.x");
    if (typeof v.y !== "number") throw new ValidationError("missing v.y");

    return v as t.Vector;
}

// validateMapBackground validates the needed type constraints
// from v and cast it to MapBackground.
export function validateMapBackground(v: any): t.MapBackground {
    if (typeof v.asset !== "string") throw new ValidationError("missing v.asset");
    if (v.mode === undefined) throw new ValidationError("missing v.mode");

    return v as t.MapBackground;
}

// validateEvent validates the needed type constraints
// from v and cast it to Event.
export function validateEvent(v: any): t.Event {
    switch (v.type) {
        case "HELLO": {
            validateHelloEvent(v);
            break;
        }
        case "WARNING": {
            validateWarningEvent(v);
            break;
        }
        case "LEVEL_JOINED": {
            validateLevelJoinedEvent(v);
            break;
        }
        case "LEVEL_FINISHED": {
            validateLevelFinishedEvent(v);
            break;
        }
        case "PERSONAL_SCORES": {
            validatePersonalScoresEvent(v);
            break;
        }
        case "LEADERBOARD_UPDATE": {
            validateLeaderboardUpdateEvent(v);
            break;
        }
        case "GLOBAL_LEADERBOARD_UPDATE": {
            validateGlobalLeaderboardUpdateEvent(v);
            break;
        }
        case "ENTITY_MOVE": {
            validateEntityMoveEvent(v);
            break;
        }
        case undefined: {
            throw new ValidationError("missing v.type");
        }
        default: {
            throw new ValidationError("unknown v.type given");
        }
    }

    return v as t.Event;
}

// validateLevelInfo validates the needed type constraints
// from v and cast it to LevelInfo.
export function validateLevelInfo(v: any): t.LevelInfo {
    if (typeof v.number !== "number") throw new ValidationError("missing v.number");

    return v as t.LevelInfo;
}

// validateHelloEvent validates the needed type constraints
// from v and cast it to HelloEvent.
export function validateHelloEvent(v: any): t.HelloEvent {
    if (v.type !== "HELLO") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (typeof v.d.username !== "string") throw new ValidationError("missing v.d.username");
    if (typeof v.d.levels !== "object") throw new ValidationError("missing v.d.levels");

    return v as t.HelloEvent;
}

// validateWarningEvent validates the needed type constraints
// from v and cast it to WarningEvent.
export function validateWarningEvent(v: any): t.WarningEvent {
    if (v.type !== "WARNING") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (typeof v.d.message !== "string") throw new ValidationError("missing v.d.message");

    return v as t.WarningEvent;
}

// validateLevelJoinedEvent validates the needed type constraints
// from v and cast it to LevelJoinedEvent.
export function validateLevelJoinedEvent(v: any): t.LevelJoinedEvent {
    if (v.type !== "LEVEL_JOINED") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (typeof v.d.level !== "number") throw new ValidationError("missing v.d.level");
    if (v.d.info === undefined) throw new ValidationError("missing v.d.info");
    validateLevelInfo(v.d.info);
    if (v.d.raw === undefined) throw new ValidationError("missing v.d.raw");
    if (v.d.metadata === undefined) throw new ValidationError("missing v.d.metadata");

    return v as t.LevelJoinedEvent;
}

// validateLevelFinishedEvent validates the needed type constraints
// from v and cast it to LevelFinishedEvent.
export function validateLevelFinishedEvent(v: any): t.LevelFinishedEvent {
    if (v.type !== "LEVEL_FINISHED") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (typeof v.d.level !== "number") throw new ValidationError("missing v.d.level");
    if (typeof v.d.won !== "boolean") throw new ValidationError("missing v.d.won");
    if (v.d.time === undefined) throw new ValidationError("missing v.d.time");

    return v as t.LevelFinishedEvent;
}

// validatePersonalScoresEvent validates the needed type constraints
// from v and cast it to PersonalScoresEvent.
export function validatePersonalScoresEvent(v: any): t.PersonalScoresEvent {
    if (v.type !== "PERSONAL_SCORES") throw new ValidationError("missing v.type");
    if (typeof v.d !== "object") throw new ValidationError("missing v.d");

    return v as t.PersonalScoresEvent;
}

// validatePersonalScore validates the needed type constraints
// from v and cast it to PersonalScore.
export function validatePersonalScore(v: any): t.PersonalScore {
    if (typeof v.level !== "number") throw new ValidationError("missing v.level");
    if (typeof v.rank !== "number") throw new ValidationError("missing v.rank");
    if (v.bestTime === undefined) throw new ValidationError("missing v.bestTime");

    return v as t.PersonalScore;
}

// validateLeaderboardUpdateEvent validates the needed type constraints
// from v and cast it to LeaderboardUpdateEvent.
export function validateLeaderboardUpdateEvent(v: any): t.LeaderboardUpdateEvent {
    if (v.type !== "LEADERBOARD_UPDATE") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");

    return v as t.LeaderboardUpdateEvent;
}

// validateLevelLeaderboard validates the needed type constraints
// from v and cast it to LevelLeaderboard.
export function validateLevelLeaderboard(v: any): t.LevelLeaderboard {
    if (typeof v.level !== "number") throw new ValidationError("missing v.level");
    if (typeof v.scores !== "object") throw new ValidationError("missing v.scores");

    return v as t.LevelLeaderboard;
}

// validateLevelScore validates the needed type constraints
// from v and cast it to LevelScore.
export function validateLevelScore(v: any): t.LevelScore {
    if (typeof v.rank !== "number") throw new ValidationError("missing v.rank");
    if (typeof v.username !== "string") throw new ValidationError("missing v.username");
    if (v.bestTime === undefined) throw new ValidationError("missing v.bestTime");

    return v as t.LevelScore;
}

// validateGlobalLeaderboardUpdateEvent validates the needed type constraints
// from v and cast it to GlobalLeaderboardUpdateEvent.
export function validateGlobalLeaderboardUpdateEvent(v: any): t.GlobalLeaderboardUpdateEvent {
    if (v.type !== "GLOBAL_LEADERBOARD_UPDATE") throw new ValidationError("missing v.type");
    if (typeof v.d !== "object") throw new ValidationError("missing v.d");

    return v as t.GlobalLeaderboardUpdateEvent;
}

// validateGlobalScore validates the needed type constraints
// from v and cast it to GlobalScore.
export function validateGlobalScore(v: any): t.GlobalScore {
    if (typeof v.rank !== "number") throw new ValidationError("missing v.rank");
    if (typeof v.username !== "string") throw new ValidationError("missing v.username");
    if (typeof v.score !== "number") throw new ValidationError("missing v.score");

    return v as t.GlobalScore;
}

// validateEntityPositionData validates the needed type constraints
// from v and cast it to EntityPositionData.
export function validateEntityPositionData(v: any): t.EntityPositionData {
    if (v.initialPosition === undefined) throw new ValidationError("missing v.initialPosition");
    validateVector(v.initialPosition);
    if (v.position === undefined) throw new ValidationError("missing v.position");
    validateVector(v.position);

    return v as t.EntityPositionData;
}

// validateEntityMoveEvent validates the needed type constraints
// from v and cast it to EntityMoveEvent.
export function validateEntityMoveEvent(v: any): t.EntityMoveEvent {
    if (v.type !== "ENTITY_MOVE") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (typeof v.d.level !== "number") throw new ValidationError("missing v.d.level");
    if (typeof v.d.entities !== "object") throw new ValidationError("missing v.d.entities");

    return v as t.EntityMoveEvent;
}

// validateCommand validates the needed type constraints
// from v and cast it to Command.
export function validateCommand(v: any): t.Command {
    switch (v.type) {
        case "JOIN": {
            validateJoinCommand(v);
            break;
        }
        case "MOVE": {
            validateMoveCommand(v);
            break;
        }
        case undefined: {
            throw new ValidationError("missing v.type");
        }
        default: {
            throw new ValidationError("unknown v.type given");
        }
    }

    return v as t.Command;
}

// validateJoinCommand validates the needed type constraints
// from v and cast it to JoinCommand.
export function validateJoinCommand(v: any): t.JoinCommand {
    if (v.type !== "JOIN") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (v.d.level === undefined) throw new ValidationError("missing v.d.level");

    return v as t.JoinCommand;
}

// validateMoveCommand validates the needed type constraints
// from v and cast it to MoveCommand.
export function validateMoveCommand(v: any): t.MoveCommand {
    if (v.type !== "MOVE") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (v.d.position === undefined) throw new ValidationError("missing v.d.position");
    validateVector(v.d.position);

    return v as t.MoveCommand;
}
