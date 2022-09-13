// ValidationError is thrown on every error returned by validateX
// functions.
export class ValidationError extends Error {
}
// validateVector validates the needed type constraints
// from v and cast it to Vector.
export function validateVector(v) {
    if (typeof v.x !== "number") {
        throw new ValidationError("missing v.x");
    }
    if (typeof v.y !== "number") {
        throw new ValidationError("missing v.y");
    }
    return v;
}
// validateEvent validates the needed type constraints
// from v and cast it to Event.
export function validateEvent(v) {
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
    return v;
}
// validateLevelInfo validates the needed type constraints
// from v and cast it to LevelInfo.
export function validateLevelInfo(v) {
    if (typeof v.number !== "number") {
        throw new ValidationError("missing v.number");
    }
    return v;
}
// validateHelloEvent validates the needed type constraints
// from v and cast it to HelloEvent.
export function validateHelloEvent(v) {
    if (v.type !== "HELLO") {
        throw new ValidationError("missing v.type");
    }
    if (v.d === undefined) {
        throw new ValidationError("missing v.d");
    }
    if (typeof v.d.username !== "string") {
        throw new ValidationError("missing v.d.username");
    }
    if (typeof v.d.levels !== "object") {
        throw new ValidationError("missing v.d.levels");
    }
    return v;
}
// validateWarningEvent validates the needed type constraints
// from v and cast it to WarningEvent.
export function validateWarningEvent(v) {
    if (v.type !== "WARNING") {
        throw new ValidationError("missing v.type");
    }
    if (v.d === undefined) {
        throw new ValidationError("missing v.d");
    }
    if (typeof v.d.message !== "string") {
        throw new ValidationError("missing v.d.message");
    }
    return v;
}
// validateLevelJoinedEvent validates the needed type constraints
// from v and cast it to LevelJoinedEvent.
export function validateLevelJoinedEvent(v) {
    if (v.type !== "LEVEL_JOINED") {
        throw new ValidationError("missing v.type");
    }
    if (v.d === undefined) {
        throw new ValidationError("missing v.d");
    }
    if (typeof v.d.level !== "number") {
        throw new ValidationError("missing v.d.level");
    }
    if (v.d.info === undefined) {
        throw new ValidationError("missing v.d.info");
    }
    validateLevelInfo(v.d.info);
    if (v.d.raw === undefined) {
        throw new ValidationError("missing v.d.raw");
    }
    if (v.d.metadata === undefined) {
        throw new ValidationError("missing v.d.metadata");
    }
    return v;
}
// validateLevelFinishedEvent validates the needed type constraints
// from v and cast it to LevelFinishedEvent.
export function validateLevelFinishedEvent(v) {
    if (v.type !== "LEVEL_FINISHED") {
        throw new ValidationError("missing v.type");
    }
    if (v.d === undefined) {
        throw new ValidationError("missing v.d");
    }
    if (typeof v.d.level !== "number") {
        throw new ValidationError("missing v.d.level");
    }
    if (typeof v.d.won !== "boolean") {
        throw new ValidationError("missing v.d.won");
    }
    if (v.d.time === undefined) {
        throw new ValidationError("missing v.d.time");
    }
    return v;
}
// validatePersonalScoresEvent validates the needed type constraints
// from v and cast it to PersonalScoresEvent.
export function validatePersonalScoresEvent(v) {
    if (v.type !== "PERSONAL_SCORES") {
        throw new ValidationError("missing v.type");
    }
    if (typeof v.d !== "object") {
        throw new ValidationError("missing v.d");
    }
    return v;
}
// validatePersonalScore validates the needed type constraints
// from v and cast it to PersonalScore.
export function validatePersonalScore(v) {
    if (typeof v.level !== "number") {
        throw new ValidationError("missing v.level");
    }
    if (v.your_best === undefined) {
        throw new ValidationError("missing v.your_best");
    }
    if (v.global_best === undefined) {
        throw new ValidationError("missing v.global_best");
    }
    return v;
}
// validateLeaderboardUpdateEvent validates the needed type constraints
// from v and cast it to LeaderboardUpdateEvent.
export function validateLeaderboardUpdateEvent(v) {
    if (v.type !== "LEADERBOARD_UPDATE") {
        throw new ValidationError("missing v.type");
    }
    if (v.d === undefined) {
        throw new ValidationError("missing v.d");
    }
    return v;
}
// validateLevelLeaderboard validates the needed type constraints
// from v and cast it to LevelLeaderboard.
export function validateLevelLeaderboard(v) {
    if (typeof v.level !== "number") {
        throw new ValidationError("missing v.level");
    }
    if (typeof v.scores !== "object") {
        throw new ValidationError("missing v.scores");
    }
    return v;
}
// validateLevelScore validates the needed type constraints
// from v and cast it to LevelScore.
export function validateLevelScore(v) {
    if (typeof v.username !== "string") {
        throw new ValidationError("missing v.username");
    }
    if (v.bestTime === undefined) {
        throw new ValidationError("missing v.bestTime");
    }
    return v;
}
// validateEntityPositionData validates the needed type constraints
// from v and cast it to EntityPositionData.
export function validateEntityPositionData(v) {
    if (v.initial === undefined) {
        throw new ValidationError("missing v.initial");
    }
    validateVector(v.initial);
    if (v.position === undefined) {
        throw new ValidationError("missing v.position");
    }
    validateVector(v.position);
    return v;
}
// validateEntityMoveEvent validates the needed type constraints
// from v and cast it to EntityMoveEvent.
export function validateEntityMoveEvent(v) {
    if (v.type !== "ENTITY_MOVE") {
        throw new ValidationError("missing v.type");
    }
    if (v.d === undefined) {
        throw new ValidationError("missing v.d");
    }
    if (typeof v.d.level !== "number") {
        throw new ValidationError("missing v.d.level");
    }
    if (typeof v.d.entities !== "object") {
        throw new ValidationError("missing v.d.entities");
    }
    return v;
}
// validateCommand validates the needed type constraints
// from v and cast it to Command.
export function validateCommand(v) {
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
    return v;
}
// validateJoinCommand validates the needed type constraints
// from v and cast it to JoinCommand.
export function validateJoinCommand(v) {
    if (v.type !== "JOIN") {
        throw new ValidationError("missing v.type");
    }
    if (v.d === undefined) {
        throw new ValidationError("missing v.d");
    }
    if (typeof v.d.level !== "number") {
        throw new ValidationError("missing v.d.level");
    }
    return v;
}
// validateMoveCommand validates the needed type constraints
// from v and cast it to MoveCommand.
export function validateMoveCommand(v) {
    if (v.type !== "MOVE") {
        throw new ValidationError("missing v.type");
    }
    if (v.d === undefined) {
        throw new ValidationError("missing v.d");
    }
    if (v.d.position === undefined) {
        throw new ValidationError("missing v.d.position");
    }
    validateVector(v.d.position);
    return v;
}
