// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

class Fatal extends Error {
    constructor(msg, code = 1008){
        super(msg);
        this.code = code;
    }
    code;
}
class ExtendedWebSocket {
    constructor(socket, handlers){
        this.socket = socket;
        this.socket.onopen = handlers.onOpen;
        this.socket.onclose = (ev)=>{
            handlers.onClose(ev.code);
        };
        this.socket.onmessage = (ev)=>{
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
    catchError(err) {
        if (err instanceof Fatal) {
            this.closeWithError(err.message, err.code);
        } else {
            this.send({
                type: "WARNING",
                d: {
                    message: `${err}`
                }
            });
        }
    }
    send(data) {
        const p = JSON.stringify(data);
        this.socket.send(p);
    }
    close() {
        this.socket.close();
    }
    closeWithError(error, code = 1008) {
        this.socket.close(code, error);
    }
    socket;
}
export { Fatal as Fatal };
export { ExtendedWebSocket as ExtendedWebSocket };
