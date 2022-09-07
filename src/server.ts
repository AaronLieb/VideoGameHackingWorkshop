import { http } from "/src/deps.ts";
import * as ws from "/src/ws.ts";
import * as sqlite from "/src/store/sqlite.ts";
import * as session from "/src/session.ts";

const port = parseInt(Deno.env.get("VGHW_PORT") || "8080");
const store = sqlite.New(Deno.env.get("VGHW_DB") || "/tmp/vghw-dev.db");

const handler = async (request: Request): Promise<Response> => {
    const url = new URL(request.url);

    switch (url.pathname) {
        case "/api/ws": {
            if (request.method != "GET") {
                return http.RespondStatus(http.Status.MethodNotAllowed);
            }

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

            switch (request.method) {
                case "GET":
                    return http.RespondStatus(http.Status.Unauthorized);
                case "POST":
                    break; // do below
                default:
                    return http.RespondStatus(http.Status.MethodNotAllowed);
            }

            let form;
            try {
                form = await request.formData();
            } catch (err) {
                return http.Respond(`${err}`, http.Status.BadRequest);
            }

            const username = form.get("username");
            if (!username) {
                return http.Respond("missing username in form", http.Status.BadRequest);
            }

            const headers = new Headers();
            http.setCookie(headers, {
                name: "VGHW-Username",
                value: username.toString(),
                path: "/",
            });

            return http.Redirect(`${url.protocol}//${url.host}`, http.Status.Found, {
                headers: headers,
            });
        }
        default: {
            if (url.pathname.startsWith("/public")) {
                url.pathname = url.pathname.replace("/public", "");
            }

            if (url.pathname.endsWith("/")) {
                url.pathname += "index.html";
            }

            return http
                .serveFile(request, "./public" + url.pathname)
                .catch((_: Deno.errors.NotFound) => http.RespondStatus(404));
        }
    }
};

console.log(`HTTP webserver running. Access it at: http://localhost:${port}/`);
await http.serve(handler, { port });
