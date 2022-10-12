import { Game } from "/public/js/game/game.js";
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

    #entities;
    #blocks;
    #player;
    #ws;

    // Callbacks
    tickCallback;
    frankCallback;

    constructor(map) {
        this.map = map;
        this.game = new Game(map.width, map.height);
        this.#entities = [];
        this.backgrounds = [];

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
            let entity;
            if (assetID == "player") {
                entity = new Player(block, pos);
                this.#player = entity;
            } else {
                entity = new Entity(block, pos, assetID, mods);
            }
            this.addEntity(entity);
        });

        this.engine = new Engine("client", this.map, this.player, this.entities);

        this.tickCallback = (delta) => this.tick(delta);
        this.game.engineTicker.add(this.tickCallback);

        // We need this for Set's internal equality check.
        this.frankCallback = () => this.#spawnFrank();
        input.registerSecret("FRNK", this.frankCallback);
    }

    destroy() {
        input.unregisterSecret("FRNK", this.frankCallback);
        this.game.engineTicker.remove(this.tickCallback);
        this.game.destroy();
    }

    addEntity(entity) {
        this.#entities.push(entity);
        this.game.stage.addChild(entity.sprite);
    }

    removeEntity(entity) {
        const idx = this.#entities.indexOf(entity);
        if (idx != -1) {
            this.#entities.splice(idx, 1);
            this.game.stage.removeChild(entity.sprite);
        }
    }

    handleEvent(ws, ev) {
        switch (ev.type) {
            case "_open":
                this.#ws = ws;
                break;
            case "_close":
                this.#ws = undefined;
                break;
            case "ENTITY_MOVE":
                for (const update of ev.d.entities) {
                    const entity = this.#entities.find((sprite) => {
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

    tick(delta) {
        const diff = this.engine.tick(delta);
        if (this.#ws && diff) {
            const positionData = diff.map((ent) => ent.positionData);
            this.#ws.send({
                type: "ENTITY_MOVE",
                d: { entities: positionData },
            });
        }

        this.game.camera.focus(this.#player.position);
    }

    #spawnFrank() {
        const frank = new RainingFrank(this.game);
        this.addEntity(frank);
    }
}
