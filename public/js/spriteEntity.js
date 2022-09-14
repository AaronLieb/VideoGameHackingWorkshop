import { PIXI } from "/public/js/deps.js";
import { Entity } from "/public/js/common/entity.js";
import { BlockSize } from "/public/js/common/types.js";
import { AssetPath } from "/public/js/common/map.js";

export function SpriteFromAsset(assetID, scale = true) {
    const path = AssetPath(assetID);

    let sprite;
    if (path == "") {
        sprite = PIXI.Sprite.from(PIXI.Texture.EMPTY);
    } else {
        sprite = PIXI.Sprite.from(path);

        if (scale) {
            const onLoaded = () => {
                const wscale = BlockSize / sprite.texture.baseTexture.realWidth;
                const hscale = BlockSize / sprite.texture.baseTexture.realHeight;
                sprite.scale.set(wscale, hscale);
                sprite.texture.baseTexture.removeListener("loaded", onLoaded);
            };
            sprite.texture.baseTexture.scaleMode = PIXI.NEAREST;
            sprite.texture.baseTexture.on("loaded", onLoaded);
        }
    }

    return sprite;
}

export class SpriteEntity extends Entity {
    sprite;

    constructor(block, initialPos, sprite) {
        super(block, initialPos);
        this.sprite = sprite;
        this.sprite.x = initialPos.x * BlockSize;
        this.sprite.y = initialPos.y * BlockSize;

        Object.defineProperty(this.sprite, "position", {
            get() {
                return this.position;
            },
            set(pos) {
                this.position = pos;
            },
        });
    }
}
