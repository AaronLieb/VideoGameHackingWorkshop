import { PIXI } from "/public/js/deps.js";
import { BlockSize, ZP } from "/public/js/common/types.js";
import { Entity as CommonEntity } from "/public/js/common/entity.js";
import { AssetPath } from "/public/js/common/map.js";

export function TextureFromAsset(assetID) {
    const path = AssetPath(assetID);

    let texture;
    if (path == "") {
        texture = PIXI.Texture.EMPTY;
    } else {
        texture = PIXI.Texture.from(path);
    }

    texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    texture.baseTexture.mipmap = PIXI.MIPMAP_MODES.POW2;
    texture.baseTexture.update();
    return texture;
}

export function SpriteFromAsset(assetID, mods = [], opts = undefined) {
    const texture = TextureFromAsset(assetID);
    return SpriteFromTexture(texture, mods, opts);
}

export function SpriteFromTexture(texture, mods = [], opts = undefined) {
    const sprite = PIXI.Sprite.from(texture, opts);
    sprite.roundPixels = true;

    if (!mods || !mods.include || !mods.include("fixed")) {
        const applyScale = () => {
            const wscale = BlockSize / texture.baseTexture.realWidth;
            const hscale = BlockSize / texture.baseTexture.realHeight;
            sprite.scale.set(wscale, hscale);
        };

        sprite.texture.baseTexture.on("loaded", () => applyScale());
        applyScale();
        sprite.texture.baseTexture.update();
    }

    return sprite;
}

export class Entity extends CommonEntity {
    mods; // readonly
    block; // readonly
    sprite;
    initialPosition; // readonly

    velocity; // Vector
    acceleration; // Vector

    constructor(block, pos, spriteOrAssetID, mods = []) {
        super();

        let sprite = spriteOrAssetID;
        if (typeof sprite == "string") {
            sprite = SpriteFromAsset(spriteOrAssetID, mods);
        }

        this.mods = mods;
        this.block = block;
        this.sprite = sprite;
        this.initialPosition = { ...pos }; // copy to prevent mutation

        this.position = pos;
        this.velocity = ZP();
        this.acceleration = ZP();
    }

    set position(pos) {
        this.sprite.x = pos.x * BlockSize;
        this.sprite.y = pos.y * BlockSize;
    }

    get position() {
        return new positionOverrider(this.sprite);
    }

    flipX(flip = true) {
        if ((flip && this.sprite.scale.x > 0) || (!flip && this.sprite.scale.x < 0)) {
            this.sprite.scale.x *= -1;
            this.sprite.anchor.x = flip ? 1 : 0;
        }
    }

    flipY(flip = true) {
        if ((flip && this.sprite.scale.y > 0) || (!flip && this.sprite.scale.y < 0)) {
            this.sprite.scale.y *= -1;
            this.sprite.anchor.y = flip ? 1 : 0;
        }
    }
}

// positionOverrider overrides Entity.position to provide block size scaling
// seamlessly.
class positionOverrider {
    sprite;
    constructor(sprite) {
        this.sprite = sprite;
    }

    set x(x) {
        this.sprite.x = x * BlockSize;
    }

    get x() {
        return this.sprite.x / BlockSize;
    }

    set y(y) {
        this.sprite.y = y * BlockSize;
    }

    get y() {
        return this.sprite.y / BlockSize;
    }
}
