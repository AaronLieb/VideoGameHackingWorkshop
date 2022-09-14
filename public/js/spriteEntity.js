import { PIXI } from "/public/js/deps.js";
import { Entity } from "/public/js/common/entity.js";
import { BlockSize } from "/public/js/common/types.js";
import { AssetPath } from "/public/js/common/map.js";

export function SpriteFromAsset(assetID, mods) {
    const path = AssetPath(assetID);

    let sprite;
    if (path == "") {
        sprite = PIXI.Sprite.from(PIXI.Texture.EMPTY);
    } else {
        sprite = PIXI.Sprite.from(path);
        sprite.roundPixels = true;

        if (!mods || !mods.include || !mods.include("fixed")) {
            sprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
            sprite.texture.baseTexture.mipmap = PIXI.MIPMAP_MODES.POW2;
            sprite.texture.baseTexture.on("loaded", () => {
                const wscale = BlockSize / sprite.texture.baseTexture.realWidth;
                const hscale = BlockSize / sprite.texture.baseTexture.realHeight;
                sprite.scale.set(wscale, hscale);
            });
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
