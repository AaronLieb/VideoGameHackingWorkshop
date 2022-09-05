// Fatal describes all fatal errors. Throwing this error causes the Websocket to
// shut down.
export class Fatal extends Error {
    constructor(msg: string, readonly code = 1008) {
        super(msg);
    }
}

export class ExtendedWebSocket {
    constructor(
        private readonly socket: WebSocket,
        handlers: {
            onOpen: () => void;
            onClose: (code: number) => void;
            onMessage: (data: unknown) => void;
        },
    ) {
        this.socket.onopen = handlers.onOpen;
        this.socket.onclose = (ev: CloseEvent) => {
            handlers.onClose(ev.code);
        };
        this.socket.onmessage = (ev: MessageEvent) => {
            if (typeof ev.data != "string") {
                this.closeWithError("server only accepts text payloads", 1003);
                return;
            }

            let payload;
            try {
                payload = JSON.parse(ev.data);
            } catch (err) {
                this.closeWithError(`invalid JSON: ${err}`, 1002);
                return;
            }

            handlers.onMessage(payload);
        };
    }

    catchError(err: unknown) {
        if (err instanceof Fatal) {
            this.closeWithError(err.message, err.code);
        } else {
            this.send({
                type: "WARNING",
                d: {
                    message: `${err}`,
                },
            });
        }
    }

    send(data: unknown) {
        const p = JSON.stringify(data);
        this.socket.send(p);
    }

    close() {
        this.socket.close();
    }

    // closeWithError closes the WebSocket with an abnormal error code. For more
    // information, see
    // https://www.rfc-editor.org/rfc/rfc6455.html#section-7.4.1.
    closeWithError(error?: string, code = 1008) {
        this.socket.close(code, error);
    }
}
