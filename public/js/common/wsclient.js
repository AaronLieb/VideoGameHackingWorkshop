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
class ExtendedWebSocket {
    constructor(socket, handlers){
        this.socket = socket;
        this.socket.onopen = handlers.onOpen;
        this.socket.onclose = (ev)=>{
            handlers.onClose(ev.code);
        };
        this.socket.onmessage = (ev)=>{
            if (typeof ev.data != "string") {
                this.closeWithError("server only accepts text payloads", 1003);
                return;
            }
            let payload;
            try {
                payload = JSON.parse(ev.data);
            } catch (err) {
                this.closeWithError(`invalid JSON: ${err}`, 1002);
                return;
            }
            handlers.onMessage(payload);
        };
    }
    send(data) {
        const p = JSON.stringify(data);
        this.socket.send(p);
    }
    close() {
        this.socket.close();
    }
    closeWithError(error, code = 1008) {
        this.socket.close(code, error);
    }
    socket;
}
class Client extends ExtendedWebSocket {
    constructor(socket, handler){
        super(socket, {
            onOpen: ()=>{
                this.dispatch({
                    type: "_open"
                });
            },
            onClose: (code)=>{
                this.dispatch({
                    type: "_close",
                    code: code
                });
            },
            onMessage: (data)=>{
                let ev;
                try {
                    ev = ValidateEvent(data);
                } catch (err) {
                    this.closeWithError(`${err}`, 1002);
                    return;
                }
                if (ev.type.startsWith("_")) {
                    this.closeWithError("illegal event type received", 1002);
                    return;
                }
                this.dispatch(ev);
            }
        });
        this.handler = handler;
    }
    dispatch(ev) {
        const promise = this.handler.handleEvent(this, ev);
        if (promise) {
            promise.catch((err)=>{
                console.warn("Websocket handler error caught:", err);
                this.closeWithError(`${err}`);
            });
        }
    }
    send(cmd) {
        super.send(cmd);
    }
    handler;
}
export { Client as Client };
