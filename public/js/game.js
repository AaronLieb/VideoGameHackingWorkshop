import { PIXI } from "/public/js/deps.js";
import { BlockSize } from "/public/js/common/types.js";

export const canvasSize = { w: 640, h: 400 };

export class Game extends PIXI.Application {
    width;
    height;

    constructor() {
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

        this.width = this.screen.width / BlockSize;
        this.height = this.screen.height / BlockSize;
    }
}

// when rendering the map, use Map.iterate()
