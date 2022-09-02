import { server } from "/src/deps.ts";

const port = 80;

const handler = (request: Request): Response => {
    let { pathname } = new URL(request.url);

    if (pathname === "/") pathname = "/public/index.html";
    pathname = `.${pathname}`;
    const body = Deno.readFileSync(pathname);
    return new Response(body, { status: 200 });
};

console.log(`HTTP webserver running. Access it at: http://localhost:${port}/`);
await server.serve(handler, { port });
