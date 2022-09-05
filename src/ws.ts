import { Command, Event } from "/src/common/types.ts";
import * as validator from "/src/common/types_validator.ts";
import * as ws from "/src/common/ws.ts";

// CommandHandler describes an object that can handle commands.
export interface CommandHandler {
    handleCommand(server: Server, cmd: Command): Promise<void> | void;
}

// Upgrade upgrades the given request to a Websocket and dispatches it to the
// given handler.
export function Upgrade(r: Request, handler: CommandHandler): Response {
    const upgrade = Deno.upgradeWebSocket(r);
    new Server(upgrade.socket, handler);
    return upgrade.response;
}

// Server is the Websocket server.
export class Server extends ws.ExtendedWebSocket {
    constructor(socket: WebSocket, private readonly handler: CommandHandler) {
        super(socket, {
            onOpen: () => {
                this.dispatch({ type: "_open" });
            },
            onClose: (code: number) => {
                this.dispatch({ type: "_close", code: code });
            },
            onMessage: (data: unknown) => {
                let cmd: Command;
                try {
                    cmd = validator.ValidateCommand(data);
                } catch (err) {
                    this.closeWithError(`${err}`, 1002);
                    return;
                }

                if (cmd.type.startsWith("_")) {
                    this.closeWithError("illegal command type given", 1002);
                    return;
                }

                this.dispatch(cmd);
            },
        });
    }

    private dispatch(cmd: Command) {
        const promise = this.handler.handleCommand(this, cmd);
        if (promise) {
            promise.catch(this.catchError);
        }
    }

    send(ev: Event) {
        super.send(ev);
    }
}
