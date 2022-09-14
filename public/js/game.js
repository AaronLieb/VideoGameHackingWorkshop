import { PIXI } from "/public/js/deps.js";
import { BlockSize } from "/public/js/common/types.js";

export const canvasSize = { w: 640, h: 400 };

export class Game extends PIXI.Application {
    constructor() {
        let type = "WebGL";
        if (!PIXI.utils.isWebGLSupported()) type = "canvas";
        PIXI.utils.sayHello(type);

        super({ width: canvasSize.w, height: canvasSize.h });
    }

    get htmlElement() {
        return this.pixi.view;
    }
}

export const createSprite = (file) => {
    return new PIXI.Sprite.from(file);
};

// when rendering the map, use Map.iterate()
