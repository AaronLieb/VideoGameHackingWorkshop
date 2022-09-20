import { PIXI } from "/public/js/deps.js";
import { AssetPath } from "/public/js/common/map.js";
import { BlockSize } from "/public/js/common/types.js";

export class Background {
    sprite;
    parallaxFactor; // TODO

    constructor(map, bg) {
        const { asset, mode } = bg;

        switch (mode) {
            case "stretched":
                this.sprite = PIXI.Sprite.from(AssetPath(asset));
                this.sprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
                this.sprite.texture.baseTexture.on("update", () => {
                    const wscale = (map.width * BlockSize) / this.sprite.texture.baseTexture.realWidth;
                    const hscale = (map.height * BlockSize) / this.sprite.texture.baseTexture.realHeight;
                    this.sprite.scale.set(wscale, hscale);
                });
                break;
            case "tiled":
                this.sprite = PIXI.TilingSprite.from(AssetPath(asset), {
                    width: map.width * BlockSize,
                    height: map.height * BlockSize,
                });
                this.sprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
                this.sprite.texture.baseTexture.on("update", () => {
                    const scale = (map.height * BlockSize) / this.sprite.texture.baseTexture.realHeight;
                    this.sprite.scale.set(scale, scale);
                });
                break;
            default:
                throw `unknown background mode ${mode}`;
        }

        this.sprite.x = 0;
        this.sprite.y = 0;
        this.sprite.texture.baseTexture.update();
    }
}
