import { Command, Event } from "/src/common/types.ts";
import * as validator from "/src/common/types_validator.ts";
import * as ws from "/src/common/ws.ts";

export interface EventHandler {
    handleEvent(ws: Client, ev: Event): Promise<void> | void;
}

export class Client extends ws.ExtendedWebSocket {
    constructor(socket: WebSocket, private readonly handler: EventHandler) {
        super(socket, {
            onOpen: () => {
                this.dispatch({ type: "_open" });
            },
            onClose: (code: number) => {
                this.dispatch({ type: "_close", code: code });
            },
            onMessage: (data: unknown) => {
                let ev: Event;
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
    }

    private dispatch(ev: Event) {
        const promise = this.handler.handleEvent(this, ev);
        if (promise) {
            promise.catch((err) => {
                console.warn("Websocket handler error caught:", err);
                this.closeWithError(`${err}`);
            });
        }
    }

    send(cmd: Command) {
        super.send(cmd);
    }
}
