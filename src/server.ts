import { http } from "/src/deps.ts";
import * as ws from "/src/ws.ts";
import * as sqlite from "/src/store/sqlite.ts";
import * as session from "/src/session.ts";

const port = parseInt(Deno.env.get("VGHW_PORT") || "8080");
const store = sqlite.New(Deno.env.get("VGHW_DB") || "/tmp/vghw-dev.db");

const handler = async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    if (url.pathname == "/") {
        url.pathname = "/public/";
    }

    switch (url.pathname) {
        case "/api/ws": {
            const cookies = http.getCookies(request.headers);
            if (!cookies["VGHW-Username"]) {
                return http.RespondStatus(http.Status.Unauthorized);
            }

            if (request.headers.get("Upgrade") != "websocket") {
                return http.Respond("missing Upgrade header", http.Status.BadRequest);
            }

            const sess = new session.Session(store, cookies["VGHW-Username"]);
            return ws.Upgrade(request, sess);
        }
        case "/api/auth": {
            const cookies = http.getCookies(request.headers);
            if (cookies["VGHW-Username"]) {
                return http.RespondStatus(http.Status.OK);
            }

            const form = await request.formData();
            const username = form.get("username");
            if (!username) {
                return http.Respond("missing username in form", http.Status.BadRequest);
            }

            const response = http.RespondStatus(http.Status.OK);
            http.setCookie(response.headers, {
                name: "VGHW-Username",
                value: username.toString(),
                path: "/",
            });

            return response;
        }
        default: {
            if (url.pathname.endsWith("/")) {
                url.pathname += "index.html";
            }

            return http
                .serveFile(request, "." + url.pathname)
                .catch((_: Deno.errors.NotFound) => http.RespondStatus(404));
        }
    }
};

console.log(`HTTP webserver running. Access it at: http://localhost:${port}/`);
await http.serve(handler, { port });
