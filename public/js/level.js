import { AssetPath, Map } from "/public/js/common/map.js";

class Level {
    constructor(map) {
        this.map = map;
        this.sprites = [];
        this.map.iterate((pos, _, assetId) => {
            let sprite = PIXI.Sprite.from(AssetPath(assetId));
            sprite.x = pos.x;
            sprite.y = pos.y;
            sprites.push(sprite);
        });
    }
}
