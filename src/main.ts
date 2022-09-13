import { http } from "/src/deps.ts";
import * as handler from "/src/handler.ts";
import * as sqlite from "/src/store/sqlite.ts";
import * as env from "/src/env.ts";
import * as ws from "/src/ws.ts";

console.log("initializing...");

const port = parseInt(env.VGHW_PORT || "8080");
const store = await sqlite.Open(env.VGHW_DB || "/tmp/vghw-dev.db");
const wsPool = new ws.ServerPool();
const handle = handler.New(store, wsPool);
const server = new http.Server({
    port: port,
    handler: handle,
});

Deno.addSignalListener("SIGINT", () => {
    store.close();
    wsPool.close();
    server.close();

    Deno.exit();
});

console.log(`listening at http://localhost:${port}`);
await server.listenAndServe();
