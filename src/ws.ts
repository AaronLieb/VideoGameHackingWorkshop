import { Command, Event } from "/src/common/types.ts";
import * as validator from "/src/common/types_validator.ts";

// Fatal describes all fatal errors. Throwing this error causes the Websocket to
// shut down.
export class Fatal extends Error {
    constructor(msg: string, readonly code = 1008) {
        super(msg);
    }
}

// CommandHandler describes an object that can handle commands.
export interface CommandHandler {
    handleCommand(server: Server, cmd: Command): Promise<void>;
}

// Upgrade upgrades the given request to a Websocket and dispatches it to the
// given handler.
export function Upgrade(r: Request, handler: CommandHandler): Response {
    const upgrade = Deno.upgradeWebSocket(r);
    new Server(upgrade.socket, handler);
    return upgrade.response;
}

// Server is the Websocket server.
export class Server {
    private readonly socket: WebSocket;
    private readonly handler: CommandHandler;

    constructor(socket: WebSocket, handler: CommandHandler) {
        this.handler = handler;
        this.socket = socket;
        this.socket.onopen = () => {
            this.dispatch({ type: "_open" });
        };
        this.socket.onclose = (ev: CloseEvent) => {
            this.dispatch({ type: "_close", code: ev.code });
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

            if (cmd.type.startsWith("_")) {
                this.closeWithError("illegal command name given", 1002);
                return;
            }

            this.dispatch(cmd);
        };
    }

    private dispatch(cmd: Command) {
        this.handler.handleCommand(this, cmd).catch((err) => {
            if (err instanceof Fatal) {
                this.closeWithError(err.message, err.code);
            } else {
                this.send({
                    type: "WARNING",
                    d: {
                        message: `${err}`,
                    },
                });
            }
        });
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
}
