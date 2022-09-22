import { PIXI } from "/public/js/deps.js";
import { BlockSize, TickDuration, TickRate } from "/public/js/common/types.js";
import * as idle from "/public/js/internal/idle.js";
import * as fps from "/public/js/game/fps.js";
import * as input from "/public/js/input.js";
import * as camera from "/public/js/game/camera.js";

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
    // camera is the game camera instance.
    camera; // camera.Camera
    // frameTicker is the ticker instance for rendering the game. It varies
    // across systems depending on the refresh/rendering rate of the browser.
    frameTicker; // PIXI.Ticker
    // engineTicker is the ticker instance for the Physics engine as well as all
    // its logic. It is fixed to the TickRate defined in types.ts.
    engineTicker = Game.ticker; // PIXI.Ticker

    #onIdle;
    #toggleFPSCallback;
    #FPSCounter;

    constructor() {
        super({
            width: canvasSize.w,
            height: canvasSize.h,
            backgroundAlpha: 0,
            sharedLoader: true,
            sharedTicker: false,
        });

        this.frameTicker = this.ticker;
        this.engineTicker = PIXI.Ticker.shared;

        this.camera = new camera.Camera(this);

        this.#onIdle = (idle) => {
            this.frameTicker.maxFPS = idle ? 30 : 0;
        };
        idle.onIdle(this.#onIdle);

        this.#toggleFPSCallback = () => this.#toggleFPS();
        input.registerSecret("FPS", this.#toggleFPSCallback);
        input.registerSecret("TPS", this.#toggleFPSCallback);
    }

    destroy() {
        if (this.#FPSCounter) {
            this.#toggleFPS();
        }

        this.camera.destroy();
        idle.removeOnIdle(this.#onIdle);
        input.unregisterSecret("FPS", this.#toggleFPSCallback);
        input.unregisterSecret("TPS", this.#toggleFPSCallback);
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

    #toggleFPS() {
        if (!this.view.parentNode) {
            // View doesn't have a parent node yet, meaning it's probably not
            // visible yet. Just don't do anything.
            return;
        }

        if (this.#FPSCounter) {
            this.view.parentNode.removeChild(this.#FPSCounter.element);
            this.#FPSCounter.destroy();
            this.#FPSCounter = undefined;
        } else {
            this.#FPSCounter = new fps.Counter(this);
            this.view.parentNode.appendChild(this.#FPSCounter.element);
        }
    }
}
