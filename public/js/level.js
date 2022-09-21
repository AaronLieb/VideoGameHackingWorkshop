import { Game } from "/public/js/game.js";
import { Engine } from "/public/js/common/physics.js";
import { Player } from "/public/js/entity/player.js";
import { BlockSize } from "/public/js/common/types.js";
import { VecEq } from "/public/js/common/entity.js";
import { SpriteEntity, SpriteFromAsset } from "/public/js/entity/spriteEntity.js";
import { RainingFrank } from "/public/js/entity/frank.js";
import { Background } from "/public/js/entity/background.js";
import * as input from "/public/js/input.js";

export class Level {
    map;
    game;
    engine;
    entities; // Entity[]
    sprites;
    backgrounds; // Background[]
    player;
    frankCallback;

    constructor(map) {
        this.map = map;
        this.game = new Game();
        this.engine = new Engine(this.map);

        this.entities = [];
        this.sprites = [];

        if (this.map.metadata.backgrounds) {
            // Iterate from the bottom, which is the bottom-most layer. We keep
            // layering backgrounds using this loop.
            for (let i = this.map.metadata.backgrounds.length - 1; i >= 0; i--) {
                const background = new Background(this.map, this.map.metadata.backgrounds[i]);
                this.game.stage.addChild(background.sprite);
            }
        }

        this.map.iterate((pos, _, assetID) => {
            const sprite = SpriteFromAsset(assetID);
            sprite.x = pos.x * BlockSize;
            sprite.y = pos.y * BlockSize;

            this.sprites.push(sprite);
            this.game.stage.addChild(sprite);
        });

        this.map.iterateEntities((pos, block, assetID, mods) => {
            let sprite;
            if (assetID == "player") {
                this.player = new Player(block, pos);
                sprite = this.player;
            } else {
                sprite = new SpriteEntity(block, pos, SpriteFromAsset(assetID, mods));
            }
            this.addSprite(sprite);
        });

        this.game.ticker.add((delta) => this.tick(delta));

        // We need this for Set's internal equality check.
        this.frankCallback = () => this.#spawnFrank();
        input.registerSecret("FRNK", this.frankCallback);
    }

    destroy() {
        input.unregisterSecret("FRNK", this.frankCallback);

        this.game.ticker.remove(this.tick);
        this.game.destroy();
    }

    addSprite(entity) {
        this.sprites.push(entity.sprite);
        this.entities.push(entity);
        this.game.stage.addChild(entity.sprite);
    }

    handleEvent(_ws, ev) {
        switch (ev.type) {
            case "ENTITY_MOVE": {
                for (const update of ev.d.entities) {
                    const entity = this.entities.find((entity) => {
                        return VecEq(entity.initialPosition, update.initialPosition);
                    });
                    if (!entity) {
                        console.error("skipping unknown entity at", update.initialPosition);
                        continue;
                    }
                    entity.position = update.position;
                }
                break;
            }
        }
    }

    tick(delta) {
        for (const ent of this.entities) {
            this.engine.tickEntity(ent, delta);
        }
    }

    #spawnFrank() {
        const frank = new RainingFrank(this.game);
        this.addSprite(frank);
    }
}
