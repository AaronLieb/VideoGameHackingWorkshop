import { serve } from "https://deno.land/std@0.152.0/http/server.ts";

const port = 8080;

const handler = (request: Request): Response => {
    const body = Deno.readFileSync("./public/index.html");
    return new Response(body, { status: 200 });
};

console.log(`HTTP webserver running. Access it at: http://localhost:8080/`);
await serve(handler, { port });
