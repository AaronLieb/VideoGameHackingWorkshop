// ValidationError is thrown on every error returned by ValidateX
// functions.
export class ValidationError extends Error {
}
// ValidatePosition validates the needed type constraints
// from v and cast it to Position.
export function ValidatePosition(v) {
    if (typeof v.x !== "number") {
        throw new ValidationError("missing v.x");
    }
    if (typeof v.y !== "number") {
        throw new ValidationError("missing v.y");
    }
    return v;
}
// ValidateVelocity validates the needed type constraints
// from v and cast it to Velocity.
export function ValidateVelocity(v) {
    if (typeof v.x !== "number") {
        throw new ValidationError("missing v.x");
    }
    if (typeof v.y !== "number") {
        throw new ValidationError("missing v.y");
    }
    return v;
}
// ValidateScore validates the needed type constraints
// from v and cast it to Score.
export function ValidateScore(v) {
    if (typeof v.username !== "string") {
        throw new ValidationError("missing v.username");
    }
    if (v.time === undefined) {
        throw new ValidationError("missing v.time");
    }
    return v;
}
// ValidateEvent validates the needed type constraints
// from v and cast it to Event.
export function ValidateEvent(v) {
    switch (v.type) {
        case "HELLO": {
            ValidateHelloEvent(v);
            break;
        }
        case "WARNING": {
            ValidateWarningEvent(v);
            break;
        }
        case "LEVEL_FINISHED": {
            ValidateLevelFinishedEvent(v);
            break;
        }
        case "ENTITY_MOVE": {
            ValidateEntityMoveEvent(v);
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
// ValidateHelloEvent validates the needed type constraints
// from v and cast it to HelloEvent.
export function ValidateHelloEvent(v) {
    if (v.type !== "HELLO") {
        throw new ValidationError("missing v.type");
    }
    if (v.d === undefined) {
        throw new ValidationError("missing v.d");
    }
    if (typeof v.d.username !== "string") {
        throw new ValidationError("missing v.d.username");
    }
    if (typeof v.d.nLevels !== "number") {
        throw new ValidationError("missing v.d.nLevels");
    }
    if (typeof v.d.completedLevels !== "object") {
        throw new ValidationError("missing v.d.completedLevels");
    }
    return v;
}
// ValidateWarningEvent validates the needed type constraints
// from v and cast it to WarningEvent.
export function ValidateWarningEvent(v) {
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
// ValidateLevelJoinedEvent validates the needed type constraints
// from v and cast it to LevelJoinedEvent.
export function ValidateLevelJoinedEvent(v) {
    if (v.type !== "LEVEL_JOINED") {
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
// ValidateLevelFinishedEvent validates the needed type constraints
// from v and cast it to LevelFinishedEvent.
export function ValidateLevelFinishedEvent(v) {
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
// ValidateEntityPositionData validates the needed type constraints
// from v and cast it to EntityPositionData.
export function ValidateEntityPositionData(v) {
    if (v.initial === undefined) {
        throw new ValidationError("missing v.initial");
    }
    ValidatePosition(v.initial);
    if (v.position === undefined) {
        throw new ValidationError("missing v.position");
    }
    ValidatePosition(v.position);
    return v;
}
// ValidateEntityMoveEvent validates the needed type constraints
// from v and cast it to EntityMoveEvent.
export function ValidateEntityMoveEvent(v) {
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
// ValidateCommand validates the needed type constraints
// from v and cast it to Command.
export function ValidateCommand(v) {
    switch (v.type) {
        case "JOIN": {
            ValidateJoinCommand(v);
            break;
        }
        case "MOVE": {
            ValidateMoveCommand(v);
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
// ValidateJoinCommand validates the needed type constraints
// from v and cast it to JoinCommand.
export function ValidateJoinCommand(v) {
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
// ValidateMoveCommand validates the needed type constraints
// from v and cast it to MoveCommand.
export function ValidateMoveCommand(v) {
    if (v.type !== "MOVE") {
        throw new ValidationError("missing v.type");
    }
    if (v.d === undefined) {
        throw new ValidationError("missing v.d");
    }
    if (v.d.position === undefined) {
        throw new ValidationError("missing v.d.position");
    }
    ValidatePosition(v.d.position);
    return v;
}
