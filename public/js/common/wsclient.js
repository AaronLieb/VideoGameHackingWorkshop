import * as validator from "/public/js/common/types_validator.js";
import * as ws from "/public/js/common/ws.js";
export class Client extends ws.ExtendedWebSocket {
    constructor(socket, handler) {
        super(socket, {
            onOpen: () => {
                this.dispatch({ type: "_open" });
            },
            onClose: (code) => {
                this.dispatch({ type: "_close", code: code });
            },
            onMessage: (data) => {
                let ev;
                try {
                    ev = validator.ValidateEvent(data);
                } catch (err) {
                    this.closeWithError(`${err}`, 1002);
                    return;
                }
                if (ev.type.startsWith("_")) {
                    this.closeWithError("illegal event type received", 1002);
                    return;
                }
                this.dispatch(ev);
            },
        });
        this.handler = handler;
    }
    dispatch(ev) {
        const promise = this.handler.handleEvent(this, ev);
        if (promise) {
            promise.catch((err) => {
                console.warn("Websocket handler error caught:", err);
                this.closeWithError(`${err}`);
            });
        }
    }
    send(cmd) {
        super.send(cmd);
    }
}
