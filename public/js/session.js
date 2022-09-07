import * as map from "/public/js/common/map.js";

export class Session {
    state;
    maps; // Map<int, map.Data>

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
                const m = new map.Data(ev.d.map, ev.d.metadata);
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
