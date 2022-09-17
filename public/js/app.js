import * as map from "/public/js/common/map.js";
import * as ws from "/public/js/common/wsclient.js";
import * as levelList from "/public/js/components/levelList.js";
import { Level } from "/public/js/level.js";

export class NotLoggedInError extends Error {
    constructor() {
        super("user not logged in");
    }
}

export async function Start(opts) {
    // Check if we're authenticated.
    const auth = await fetch("/api/auth");
    if (auth.status != 200) {
        throw new NotLoggedInError();
    }

    const host = location.host;
    if (!host) throw "missing location.lost";

    const session = new App(opts);

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

export class App {
    username;
    hooks; // Set<(ws, ev) => void>
    ws; // ws.Client | undefined

    level; // Level | undefined

    gameElement;
    levelsElement; // TODO
    levelsComponent;

    constructor(opts) {
        this.hooks = new Set();

        this.gameElement = opts.gameElement;
        this.levelsElement = opts.levelsElement;

        this.levelsComponent = new levelList.Component(this.levelsElement, {
            onSelectLevel: (level) => this.#joinLevel(level),
        });

        const resizer = new ResizeObserver(() => {
            if (this.level) this.level.game.resizeToElem(this.gameElement);
        });
        resizer.observe(this.gameElement);
    }

    #joinLevel(n) {
        if (this.level) {
            this.level.destroy();
            this.level = undefined;
        }

        if (!this.ws) {
            throw "websocket not connected";
        }

        this.ws.send({
            type: "JOIN",
            d: {
                level: n,
            },
        });
    }

    handleEvent(ws, ev) {
        switch (ev.type) {
            case "_open":
                this.ws = ws;
                break;
            case "_close":
                this.ws = undefined;
                break;
            case "HELLO": {
                this.username = ev.d.username;
                this.levelsComponent.set({
                    levelInfo: ev.d.levels,
                });
                break;
            }
            case "LEVEL_JOINED": {
                const levelMap = new map.LevelMap(ev.d.raw, ev.d.metadata);
                this.level = new Level(levelMap);
                this.level.game.resizeTo = this.gameElement;
                this.level.game.resizeToElem();
                this.gameElement.appendChild(this.level.game.view);
                break;
            }
            case "LEVEL_FINISHED": {
                this.gameElement.removeChild(this.level.game.view);
                this.level = undefined;
                break;
            }
            case "WARNING": {
                alert(ev.d.message);
                break;
            }
            case "VICTORY": {
                alert("You win!!11!!1!");
                break;
            }
        }

        if (this.level) {
            this.level.handleEvent(ws, ev);
        }

        for (const fn of this.hooks) {
            fn(ws, ev);
        }
    }
}
