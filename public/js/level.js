import { Game } from "/public/js/game.js";
import { Engine } from "/public/js/common/physics.js";
import { Player } from "/public/js/entity/player.js";
import { BlockSize, VecEq } from "/public/js/common/types.js";
import { Entity, SpriteFromAsset } from "/public/js/entity/entity.js";
import { RainingFrank } from "/public/js/entity/frank.js";
import { Background } from "/public/js/entity/background.js";
import * as input from "/public/js/input.js";

export class Level {
    map;
    game;
    engine;
    backgrounds; // Background[]

    entities;
    blocks;

    // Callbacks
    tickCallback;
    frankCallback;

    constructor(map) {
        this.map = map;
        this.game = new Game();
        this.entities = [];
        this.backgrounds = [];
        this.engine = new Engine(this.map, this.entities);

        if (this.map.metadata.backgrounds) {
            // Iterate from the bottom, which is the bottom-most layer. We keep
            // layering backgrounds using this loop.
            for (let i = this.map.metadata.backgrounds.length - 1; i >= 0; i--) {
                const background = new Background(this.map, this.map.metadata.backgrounds[i]);
                this.game.stage.addChild(background.sprite);
                this.backgrounds.push(background);
            }
        }

        this.map.iterate((pos, _, assetID, mods) => {
            const sprite = SpriteFromAsset(assetID, mods);
            sprite.x = pos.x * BlockSize;
            sprite.y = pos.y * BlockSize;
            this.game.stage.addChild(sprite);
        });

        this.map.iterateEntities((pos, block, assetID, mods) => {
            let sprite;
            if (assetID == "player") {
                this.player = new Player(block, pos);
                sprite = this.player;
            } else {
                sprite = new Entity(block, pos, assetID, mods);
            }
            this.addEntity(sprite);
        });

        this.tickCallback = (delta) => this.tick(delta);
        this.game.ticker.add(this.tickCallback);

        // We need this for Set's internal equality check.
        this.frankCallback = () => this.#spawnFrank();
        input.registerSecret("FRNK", this.frankCallback);
    }

    destroy() {
        input.unregisterSecret("FRNK", this.frankCallback);

        this.game.ticker.remove(this.tickCallback);
        this.game.destroy();
    }

    addEntity(entity) {
        this.entities.push(entity);
        this.game.stage.addChild(entity.sprite);
    }

    removeEntity(entity) {
        const idx = this.entities.indexOf(entity);
        if (idx != -1) {
            this.entities.splice(idx, 1);
            this.game.stage.removeChild(entity.sprite);
        }
    }

    handleEvent(_ws, ev) {
        switch (ev.type) {
            case "ENTITY_MOVE": {
                for (const update of ev.d.entities) {
                    const entity = this.entities.find((sprite) => {
                        return VecEq(sprite.initialPosition, update.initialPosition);
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
        for (const entity of this.entities) {
            this.engine.tickEntity(entity, delta);
        }
    }

    #spawnFrank() {
        const frank = new RainingFrank(this.game);
        this.addEntity(frank);
    }
}
