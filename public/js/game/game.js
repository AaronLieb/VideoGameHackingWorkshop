import { PIXI } from "/public/js/deps.js";
import { BlockSize, TickDuration, TickRate } from "/public/js/common/types.js";
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

        this.camera = new camera.Camera(this);

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
