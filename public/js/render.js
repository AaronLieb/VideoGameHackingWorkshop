const CANVAS_SIZE = { x: 640, y: 400 }

export let app;

export const initializeApp = () => {
    let type = "WebGL";
    if (!PIXI.utils.isWebGLSupported()) type = "canvas";
    PIXI.utils.sayHello(type);

    app = new PIXI.Application({ width: CANVAS_SIZE.x, height: CANVAS_SIZE.y });
    document.getElementById("game").appendChild(app.view);
};

export const createSprite = (file) => {
    return new PIXI.Sprite.from(file);
};

// when rendering the map, use Map.iterate()
