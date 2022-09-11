export let app;

export const initializeApp = () => {
    let type = "WebGL";
    if (!PIXI.utils.isWebGLSupported()) type = "canvas";
    PIXI.utils.sayHello(type);

    app = new PIXI.Application({ width: 256, height: 256 });
};

export const createSprite = (file) => {
    return new PIXI.Sprite.from(file);
};
