import * as map from "/public/js/common/map.js";
import * as ws from "/public/js/common/wsclient.js";

export function Connect(url = "ws:///api/ws") {
    const socket = new WebSocket(url);
    const session = new Session();
    const wrapped = new ws.Client(socket, session);
    return wrapped;
}

export class Session {
    state;
    maps; // Map<int, map.Map>

    constructor() {
        this.state = {};
        this.maps = new Map();
    }

    handleEvent(_ws, ev) {
        switch (ev.type) {
            case "HELLO": {
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
    }
}

export function isAuthorized() {
    return !!hasCookie("VGHW-Username"); // :^)
}

function hasCookie(name) {
    return document.cookie.match(`(?:^|; )${name}=`) != null;
}

export class Level {
    map;

    constructor(map) {
        this.map = map;
    }
}
