import { PIXI } from "/public/js/deps.js";

export const canvasSize = { w: 640, h: 400 };

export class Game extends PIXI.Application {
    constructor() {
        let type = "WebGL";
        if (!PIXI.utils.isWebGLSupported()) type = "canvas";
        PIXI.utils.sayHello(type);

        super({
            width: canvasSize.w,
            height: canvasSize.h,
            backgroundAlpha: 0,
            sharedLoader: true,
        });
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
}

// when rendering the map, use Map.iterate()
