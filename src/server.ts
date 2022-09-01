import { server } from "/src/deps.ts";
import * as ws from "/src/ws.ts";

const port = 8080;

const handler = async (request: Request): Promise<Response> => {
    let { pathname } = new URL(request.url);

    switch (pathname) {
        case "/ws": {
            if (request.headers.get("Upgrade") != "websocket") {
                return new Response("missing Upgrade header", { status: 400 });
            }

            const upgrade = Deno.upgradeWebSocket(request);

            const server = new ws.Server(upgrade.socket);
            server.addHandler((cmd: ws.Command) => {
                switch (cmd.type) {
                    case "open": {
                        server.send({
                            type: "HELLO",
                            d: {
                                nLevels: 0,
                                completedLevels: [],
                            },
                        });
                        break;
                    }
                    case "JOIN": {
                        console.log("client wants to join level", cmd.d.level);
                        break;
                    }
                    case "MOVE": {
                        if (cmd.d.position) {
                            console.log(`client moving to ${cmd.d.position.x}x${cmd.d.position.y}`);
                        }
                        if (cmd.d.velocity) {
                            console.log(`client is now moving at ${cmd.d.velocity.x}x${cmd.d.velocity.y}`);
                        }
                        break;
                    }
                }
            });

            return upgrade.response;
        }
        case "/": {
            pathname = "/public/index.html";
        }
        // fallthrough
        default: {
            pathname = `.${pathname}`;
            return await Deno.readFile(pathname)
                .then((body: Uint8Array) => new Response(body, { status: 200 }))
                .catch((_: Deno.errors.NotFound) => new Response("file not found", { status: 400 }));
        }
    }
};

console.log(`HTTP webserver running. Access it at: http://localhost:${port}/`);
await server.serve(handler, { port });
