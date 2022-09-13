export class ExtendedWebSocket {
    constructor(
        private readonly socket: WebSocket | undefined,
        handlers: {
            onOpen: () => void;
            onClose: (code: number) => void;
            onMessage: (data: unknown) => void;
        },
    ) {
        if (!this.socket) return;

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

    send(data: unknown) {
        if (!this.socket) return;
        const p = JSON.stringify(data);
        this.socket.send(p);
    }

    close() {
        this.closeWithError();
    }

    // closeWithError closes the WebSocket with an abnormal error code. For more
    // information, see
    // https://www.rfc-editor.org/rfc/rfc6455.html#section-7.4.1.
    closeWithError(error?: string, code = 1008) {
        if (!this.socket) return;
        this.socket.close(code, error);
    }
}
