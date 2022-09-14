import { Game } from "/public/js/game.js";
import { Engine } from "/public/js/common/physics.js";
import { Player } from "/public/js/player.js";
import { BlockSize } from "/public/js/common/types.js";
import { SpriteFromAsset } from "/public/js/spriteEntity.js";

export class Level {
    map;
    game;
    engine;
    entities;
    sprites;
    player;

    constructor(map) {
        this.map = map;
        this.game = new Game();
        this.engine = new Engine();

        this.entities = [];
        this.sprites = [];

        this.map.iterate((pos, _, assetID) => {
            const sprite = SpriteFromAsset(assetID);
            sprite.x = pos.x * BlockSize;
            sprite.y = pos.y * BlockSize;

            this.sprites.push(sprite);
            this.game.stage.addChild(sprite);
        });

        this.map.iterateEntities((pos, _block, assetID) => {
            if (assetID == "player") {
                this.player = new Player(pos);
                this.addSprite(this.player);
            }
        });

        this.game.ticker.add((delta) => this.loop(delta));
    }

    destroy() {
        this.game.ticker.remove(this.loop);
    }

    addSprite(entity) {
        this.sprites.push(entity);
        this.entities.push(entity);
        this.game.stage.addChild(entity.sprite);
    }

    loop(delta) {
        for (const e of this.entities) {
            this.engine.tickEntity(e, this.map, delta);
        }
    }
}
