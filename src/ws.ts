import { Command as WSCommand, Event } from "/src/common/types.ts";
import * as validator from "/src/common/types_validator.ts";

export type Command =
    | WSCommand
    | { type: "open" }
    | { type: "close"; code: number };

class handlerSet extends Set<(_: Command) => void> {
    dispatch(cmd: Command) {
        for (const handler of this) {
            handler(cmd);
        }
    }
}

// Server is the Websocket server.
export class Server {
    private socket: WebSocket;
    private handlers = new handlerSet();

    constructor(socket: WebSocket) {
        this.socket = socket;
        this.socket.onopen = () => {
            this.handlers.dispatch({ type: "open" });
        };
        this.socket.onclose = (ev: CloseEvent) => {
            this.handlers.dispatch({ type: "close", code: ev.code });
        };
        this.socket.onmessage = (ev: MessageEvent) => {
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

            let cmd: Command;
            try {
                cmd = validator.ValidateCommand(payload);
            } catch (err) {
                this.closeWithError(`${err}`, 1002);
                return;
            }

            try {
                this.handlers.dispatch(cmd);
            } catch (err) {
                console.error(err);
                this.closeWithError(`${err}`);
                return;
            }
        };
    }

    send(ev: Event) {
        const p = JSON.stringify(ev);
        this.socket.send(p);
    }

    close() {
        this.socket.close();
    }

    // closeWithError closes the WebSocket with an abnormal error code. For more
    // information, see
    // https://www.rfc-editor.org/rfc/rfc6455.html#section-7.4.1.
    closeWithError(error?: string, code = 1008) {
        this.socket.close(code, error);
    }

    addHandler(handler: (cmd: Command) => void) {
        this.handlers.add(handler);
    }
}
