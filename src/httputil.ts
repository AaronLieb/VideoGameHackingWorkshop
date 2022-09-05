import { httpstatus } from "/src/deps.ts";

export function Respond(body?: BodyInit, status = httpstatus.Status.OK): Response {
    return new Response(body, { status });
}

export function RespondStatus(status = httpstatus.Status.OK): Response {
    return Respond(httpstatus.STATUS_TEXT[status], status);
}

export function Redirect(url: string, status = httpstatus.Status.Found): Response {
    return Response.redirect(url, status);
}
