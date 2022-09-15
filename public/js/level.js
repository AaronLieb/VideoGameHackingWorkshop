import { PIXI } from "/public/js/deps.js";
import { Game } from "/public/js/game.js";
import { Engine } from "/public/js/common/physics.js";
import { Player } from "/public/js/player.js";
import { BlockSize } from "/public/js/common/types.js";
import { AssetPath } from "/public/js/common/map.js";
import { SpriteEntity, SpriteFromAsset } from "/public/js/spriteEntity.js";

export class Level {
    map;
    game;
    engine;
    entities;
    sprites;
    backgrounds; // Background[]
    player;

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

export class Background {
    sprite;
    parallaxFactor; // TODO

    constructor(map, bg) {
        const { asset, mode } = bg;

        switch (mode) {
            case "stretched":
                this.sprite = PIXI.Sprite.from(AssetPath(asset));
                this.sprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
                this.sprite.texture.baseTexture.on("update", () => {
                    const wscale = (map.width * BlockSize) / this.sprite.texture.baseTexture.realWidth;
                    const hscale = (map.height * BlockSize) / this.sprite.texture.baseTexture.realHeight;
                    this.sprite.scale.set(wscale, hscale);
                });
                break;
            case "tiled":
                this.sprite = PIXI.TilingSprite.from(AssetPath(asset), {
                    width: map.width * BlockSize,
                    height: map.height * BlockSize,
                });
                this.sprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
                this.sprite.texture.baseTexture.on("update", () => {
                    const scale = (map.height * BlockSize) / this.sprite.texture.baseTexture.realHeight;
                    this.sprite.scale.set(scale, scale);
                });
                break;
            default:
                throw `unknown background mode ${mode}`;
        }

        this.sprite.x = 0;
        this.sprite.y = 0;
        this.sprite.texture.baseTexture.update();
    }
}
