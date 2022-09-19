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
            const applyScale = () => {
                const wscale = BlockSize / sprite.texture.baseTexture.realWidth;
                const hscale = BlockSize / sprite.texture.baseTexture.realHeight;
                sprite.scale.set(wscale, hscale);
            };

            sprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
            sprite.texture.baseTexture.mipmap = PIXI.MIPMAP_MODES.POW2;
            sprite.texture.baseTexture.on("loaded", () => applyScale());
            applyScale();
            sprite.texture.baseTexture.update();
        }
    }

    return sprite;
}

export class SpriteEntity extends Entity {
    sprite;

    constructor(block, initialPos, sprite) {
        super(block, initialPos);
        // Replace Entity's position with our own, which is taken from the
        // sprite.
        delete this.position;

        this.sprite = sprite;
        this.position = initialPos;
    }

    set position(pos) {
        if (this.sprite) {
            this.sprite.x = pos.x * BlockSize;
            this.sprite.y = pos.y * BlockSize;
        }
    }

    get position() {
        if (this.sprite) {
            return {
                x: this.sprite.x / BlockSize,
                y: this.sprite.y / BlockSize,
            };
        }
        return { x: -1, y: -1 };
    }
}
