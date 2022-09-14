import { AssetPath, Map } from "/public/js/common/map.js";
import { Engine } from "/public/js/common/physics.js";
import { app } from "/public/js/render.js";

export class Level {
    constructor(map) {
        this.map = map;
        this.engine = new Engine();
        this.entities = [];
        this.sprites = [];
        this.map.iterate((pos, _, assetId) => {
            let sprite = PIXI.Sprite.from(AssetPath(assetId));
            sprite.x = pos.x;
            sprite.y = pos.y;
            this.sprites.push(sprite);
            app.stage.addChild(sprite);
        });
    }

    loop(delta) {
        this.entities.forEach((e) => {
            this.engine.tickEntity(e, this.map, delta);
        });
    }
}
