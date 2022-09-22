import { PIXI } from "/public/js/deps.js";
import { BlockSize, TickDuration, TickRate } from "/public/js/common/types.js";
import * as input from "/public/js/input.js";

export const canvasSize = { w: 640, h: 400 };

// Initialize PIXI's shared ticker. We'll use the shared ticker for our physics
// stuff, while PIXI.Application instances will use their own tickers. This is
// to allow the game to be rendered at any frame while locking our physics
// engine to a particular tick.
PIXI.Ticker.shared.stop();
PIXI.Ticker.shared.minFPS = TickRate;
PIXI.Ticker.shared.maxFPS = TickRate;
PIXI.Ticker.shared.deltaMS = TickDuration;

// Camera code taken from https://github.com/AaronLieb/acmBall/blob/main/src/Camera.js

export class Game extends PIXI.Application {
    static ticker = PIXI.Ticker.shared;

    camera;

    #toggleFPSCallback;

    constructor() {
        super({
            width: canvasSize.w,
            height: canvasSize.h,
            backgroundAlpha: 0,
            sharedLoader: true,
            sharedTicker: false,
        });

        this.camera = new Camera(this);

        this.#toggleFPSCallback = () => this.#toggleFPS();
        input.registerSecret("FPS", this.#toggleFPSCallback);
    }

    destroy() {
        input.unregisterSecret("FPS", this.#toggleFPSCallback);
        super.destroy();
    }

    // resizeToElem resizes Game to be the element's dimensions.
    resizeToElem(elem = this.resizeTo || this.view.parentNode) {
        const scale = Math.min(
            elem.clientWidth / canvasSize.w,
            elem.clientHeight / canvasSize.h,
        );
        this.stage.scale.set(scale);
        this.resize();
    }

    gameX(n) {
        return n / this.stage.scale.x / BlockSize;
    }

    gameY(n) {
        return n / this.stage.scale.y / BlockSize;
    }

    pixiX(n) {
        return n * this.stage.scale.x * BlockSize;
    }

    pixiY(n) {
        return n * this.stage.scale.y * BlockSize;
    }

    get width() {
        return this.gameX(this.screen.width);
    }

    get height() {
        return this.gameY(this.screen.height);
    }

    #toggleFPS() {}
}

export class Camera {
    // focusBounds? are the percentage that determines how big the focus box is
    // relative to the screen box.
    focusBoundsW = 0.70;
    focusBoundsH = 0.90;
    lerp = 0.45;

    constructor(game) {
        this.game = game;
        this.stage = game.stage;
        this.screen = game.screen;
        this.gameX = game.gameX;
        this.gameY = game.gameY;
        this.pixiX = game.pixiX;
        this.pixiY = game.pixiY;
    }

    get x() {
        return this.game.gameX(this.stage.x);
    }

    set x(x) {
        this.stage.x = this.game.pixiX(x);
    }

    get y() {
        return this.game.gameY(this.stage.y);
    }

    set y(y) {
        this.stage.y = this.game.pixiY(y);
    }

    // focus moves the camera so that position is visible on stage.
    focus(pt) {
        const focusW = this.focusBoundsW * this.game.width;
        const focusH = this.focusBoundsH * this.game.height;

        const f = {
            p1: {
                x: -this.x + (this.game.width / 2) - (focusW / 2),
                y: -this.y + (this.game.height / 2) - (focusH / 2),
            },
            p2: {
                x: -this.x + (this.game.width / 2) + (focusW / 2),
                y: -this.y + (this.game.height / 2) + (focusH / 2),
            },
        };

        if (f.p1.x > pt.x || pt.x > f.p2.x) {
            // Point is out of bounds on the X-axis. Lerp it to the nearest
            // edge.
            if (f.p1.x > pt.x) {
                this.x -= (pt.x - f.p1.x) * this.lerp;
            }
            if (pt.x > f.p2.x) {
                this.x -= (pt.x - f.p2.x) * this.lerp;
            }
        }

        if (f.p1.y > pt.y || pt.y > f.p2.y) {
            // Point is out of bounds on the Y-axis. Lerp it to the nearest
            // edge.
            if (f.p1.y > pt.y) {
                this.y -= (pt.y - f.p1.y) * this.lerp;
            }
            if (pt.y > f.p2.y) {
                this.y -= (pt.y - f.p2.y) * this.lerp;
            }
        }
    }
}
