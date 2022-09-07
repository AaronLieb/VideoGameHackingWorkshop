// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

class ValidationError extends Error {
}
function ValidatePosition(v) {
    if (typeof v.x !== "number") throw new ValidationError("missing v.x");
    if (typeof v.y !== "number") throw new ValidationError("missing v.y");
    return v;
}
function ValidateVelocity(v) {
    if (typeof v.x !== "number") throw new ValidationError("missing v.x");
    if (typeof v.y !== "number") throw new ValidationError("missing v.y");
    return v;
}
function ValidateMapMetadata(v) {
    if (typeof v.goals !== "object") throw new ValidationError("missing v.goals");
    return v;
}
function ValidateMapGoal(v) {
    if (v.from === undefined) throw new ValidationError("missing v.from");
    ValidatePosition(v.from);
    if (v.to === undefined) throw new ValidationError("missing v.to");
    ValidatePosition(v.to);
    return v;
}
function ValidateScore(v) {
    if (typeof v.username !== "string") throw new ValidationError("missing v.username");
    if (v.time === undefined) throw new ValidationError("missing v.time");
    return v;
}
function ValidateEvent(v) {
    switch(v.type){
        case "HELLO":
            {
                ValidateHelloEvent(v);
                break;
            }
        case "WARNING":
            {
                ValidateWarningEvent(v);
                break;
            }
        case "MAP_DATA":
            {
                ValidateMapDataEvent(v);
                break;
            }
        case "VICTORY":
            {
                ValidateVictoryEvent(v);
                break;
            }
        case "CORRECTION":
            {
                ValidateCorrectionEvent(v);
                break;
            }
        case undefined:
            {
                throw new ValidationError("missing v.type");
            }
        default:
            {
                throw new ValidationError("unknown v.type given");
            }
    }
    return v;
}
function ValidateHelloEvent(v) {
    if (v.type !== "HELLO") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (typeof v.d.nLevels !== "number") throw new ValidationError("missing v.d.nLevels");
    if (typeof v.d.completedLevels !== "object") throw new ValidationError("missing v.d.completedLevels");
    return v;
}
function ValidateWarningEvent(v) {
    if (v.type !== "WARNING") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (typeof v.d.message !== "string") throw new ValidationError("missing v.d.message");
    return v;
}
function ValidateMapDataEvent(v) {
    if (v.type !== "MAP_DATA") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (typeof v.d.level !== "number") throw new ValidationError("missing v.d.level");
    if (v.d.map === undefined) throw new ValidationError("missing v.d.map");
    if (v.d.metadata === undefined) throw new ValidationError("missing v.d.metadata");
    ValidateMapMetadata(v.d.metadata);
    return v;
}
function ValidateVictoryEvent(v) {
    if (v.type !== "VICTORY") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (typeof v.d.level !== "number") throw new ValidationError("missing v.d.level");
    if (typeof v.d.time !== "number") throw new ValidationError("missing v.d.time");
    return v;
}
function ValidateCorrectionEvent(v) {
    if (v.type !== "CORRECTION") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (!(v.d.position === undefined)) {
        ValidatePosition(v.d.position);
    }
    if (!(v.d.velocity === undefined)) {
        ValidateVelocity(v.d.velocity);
    }
    return v;
}
function ValidateCommand(v) {
    switch(v.type){
        case "JOIN":
            {
                ValidateJoinCommand(v);
                break;
            }
        case "MOVE":
            {
                ValidateMoveCommand(v);
                break;
            }
        case undefined:
            {
                throw new ValidationError("missing v.type");
            }
        default:
            {
                throw new ValidationError("unknown v.type given");
            }
    }
    return v;
}
function ValidateJoinCommand(v) {
    if (v.type !== "JOIN") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (typeof v.d.level !== "number") throw new ValidationError("missing v.d.level");
    return v;
}
function ValidateMoveCommand(v) {
    if (v.type !== "MOVE") throw new ValidationError("missing v.type");
    if (v.d === undefined) throw new ValidationError("missing v.d");
    if (v.d.position === undefined) throw new ValidationError("missing v.d.position");
    ValidatePosition(v.d.position);
    return v;
}
export { ValidationError as ValidationError };
export { ValidatePosition as ValidatePosition };
export { ValidateVelocity as ValidateVelocity };
export { ValidateMapMetadata as ValidateMapMetadata };
export { ValidateMapGoal as ValidateMapGoal };
export { ValidateScore as ValidateScore };
export { ValidateEvent as ValidateEvent };
export { ValidateHelloEvent as ValidateHelloEvent };
export { ValidateWarningEvent as ValidateWarningEvent };
export { ValidateMapDataEvent as ValidateMapDataEvent };
export { ValidateVictoryEvent as ValidateVictoryEvent };
export { ValidateCorrectionEvent as ValidateCorrectionEvent };
export { ValidateCommand as ValidateCommand };
export { ValidateJoinCommand as ValidateJoinCommand };
export { ValidateMoveCommand as ValidateMoveCommand };
