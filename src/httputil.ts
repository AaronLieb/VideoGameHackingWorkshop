import { httpstatus } from "/src/deps.ts";

export function Respond(body?: BodyInit, status = httpstatus.Status.OK): Response {
    return new Response(body, { status });
}

export function RespondStatus(status = httpstatus.Status.OK): Response {
    return Respond(httpstatus.STATUS_TEXT[status], status);
}

export function Redirect(
    url: string,
    status = httpstatus.Status.Found,
    opts = {
        headers: new Headers(),
    },
): Response {
    const r = Response.redirect(url, status);

    for (const [k, v] of r.headers) {
        opts.headers.set(k, v);
    }

    return new Response(null, {
        headers: opts.headers,
        status: r.status,
        statusText: r.statusText,
    });
}
