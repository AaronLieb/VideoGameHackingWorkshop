import * as map from "/public/js/common/map.js";
import * as ws from "/public/js/common/wsclient.js";

export class NotLoggedInError extends Error {
    constructor() {
        super("user not logged in");
    }
}

// Connect ensures that the user is authorized then returns a new Session that's
// connected to the Websocket.
export async function Connect() {
    // Check if we're authenticated.
    const auth = await fetch("/api/auth");
    if (auth.status != 200) {
        throw new NotLoggedInError();
    }

    const host = location.host;
    if (!host) throw "missing location.lost";

    const session = new Session();

    // waitHello blocks until either we get a HELLO event or the Websocket
    // unexpectedly closes.
    // TODO: really refactor this. Not sure how. We don't have Go-style
    // channels.
    const waitHello = new Promise((resolve, reject) => {
        const handler = (_ws, ev) => {
            switch (ev.type) {
                case "HELLO":
                    resolve();
                    break;
                case "_close":
                    reject("Websocket unexpectedly closed");
                    break;
                default:
                    return;
            }
            session.hooks.delete(handler);
        };
        session.hooks.add(handler);
    });

    const socket = new WebSocket(`ws://${host}/api/ws`);
    new ws.Client(socket, session);

    await waitHello;
    return session;
}

export class Session {
    username;
    state;
    hooks; // Set<(ws, ev) => void>
    maps; // Map<int, map.Map>

    constructor() {
        this.state = {};
        this.hooks = new Set();
        this.maps = new Map();
    }

    handleEvent(ws, ev) {
        switch (ev.type) {
            case "HELLO": {
                this.username = ev.d.username;
                this.state.nLevels = ev.d.nLevels;
                this.state.completedLevels = ev.d.completedLevels;
                break;
            }
            case "WARNING": {
                alert(ev.d.message);
                break;
            }
            case "MAP_DATA": {
                const m = new map.Map(ev.d.map, ev.d.metadata);
                this.maps.set(ev.d.level, m);
                break;
            }
            case "VICTORY": {
                alert("You win!!11!!1!");
                break;
            }
        }

        for (const fn of this.hooks) {
            fn(ws, ev);
        }
    }
}

export class Level {
    map;

    constructor(map) {
        this.map = map;
    }
}
