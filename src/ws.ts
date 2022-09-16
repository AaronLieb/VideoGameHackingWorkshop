import { Command, Event } from "/src/common/types.ts";
import * as validator from "/src/common/types_validator.ts";
import * as ws from "/src/common/ws.ts";

export * from "/src/common/ws.ts";

// CommandHandler describes an object that can handle commands.
export interface CommandHandler {
    handleCommand(server: Server, cmd: Command): Promise<void> | void;
}

// ServerPool is a known pool of Websocket servers. It is used to emit events to
// all other servers.
export class ServerPool {
    private servers: Server[] = [];

    constructor() {
    }

    async emit(ev: Event) {
        const sendings = this.servers.map((server) =>
            new Promise((done) => {
                server.send(ev);
                done(undefined);
            })
        );
        await Promise.all(sendings);
    }

    // connect wraps the given WebSocket and returns a new Server.
    connect(socket: WebSocket): Server {
        const server = new Server(socket);
        server.handlers.push({
            handleCommand: (server: Server, cmd: Command) => {
                switch (cmd.type) {
                    case "_open": {
                        const idx = this.servers.indexOf(server);
                        if (idx == -1) this.servers.push(server);
                        break;
                    }
                    case "_close": {
                        const idx = this.servers.indexOf(server);
                        if (idx != -1) this.servers.splice(idx, 1);
                        break;
                    }
                }
            },
        });
        return server;
    }

    // upgrade upgrades the given request to a Websocket and dispatches it to
    // the given handler.
    upgrade(r: Request, ...handlers: CommandHandler[]): Response {
        const upgrade = Deno.upgradeWebSocket(r);
        const server = this.connect(upgrade.socket);
        server.handlers.push(...handlers);
        return upgrade.response;
    }

    close() {
        for (const server of this.servers) {
            server.closeWithError("server stopping", 1001 /* going away */);
        }
    }
}

// Server is the Websocket server.
export class Server extends ws.ExtendedWebSocket {
    handlers: CommandHandler[] = [];

    constructor(socket: WebSocket | undefined) {
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
                    cmd = validator.validateCommand(data);
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
        for (const handler of this.handlers) {
            try {
                const promise = handler.handleCommand(this, cmd);
                if (promise) {
                    promise.catch((err) => this.dispatchErr(err));
                }
            } catch (err) {
                this.dispatchErr(err);
            }
        }
    }

    private dispatchErr(err: Error) {
        this.send({
            type: "WARNING",
            d: {
                message: `${err}`,
            },
        });
        this.closeWithError(`${err}`);
    }

    send(ev: Event) {
        super.send(ev);
    }
}

// Noop is a ws.Server that does nothing.
export const Noop = new Server(undefined);
