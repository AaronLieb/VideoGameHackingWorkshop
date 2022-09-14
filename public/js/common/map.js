import { BlockEdges, BlockPosition, BlockType } from "/public/js/common/types.js";
export const NoTextureID = "notexture";
export const BlankTextureID = ""; // treat as all transparency
// AssetPath returns the absolute path to the object's asset given the asset ID.
export function AssetPath(id) {
    if (id === "") {
        return "";
    }
    return "/public/assets/" + id + ".png";
}
// LevelMap describes an entire map of a level.
export class LevelMap {
    constructor(raw, metadata) {
        if (metadata.blocks[" "] === undefined) {
            metadata.blocks[" "] = BlankTextureID;
        }
        this.lines = raw.split("\n");
        this.height = this.lines.length;
        this.width = 0;
        for (const line of this.lines) {
            this.width = Math.max(this.width, line.length);
        }
        // Ensure that every single map line has a constant width.
        for (let i = 0; i < this.lines.length; i++) {
            const missing = this.width - this.lines[i].length;
            if (missing > 0) {
                this.lines[i] += " ".repeat(missing);
            }
        }
        this.goals = [];
        for (const [block, mods] of Object.entries(metadata.blockMods)) {
            if (mods.includes("goal")) {
                this.goals.push(block);
            }
        }
        this.raw = this.lines.join("\n");
        this.metadata = metadata;
    }
    // block looks up the object data by a block.
    blockAsset(block, position = BlockPosition.Floating, type = BlockType.Block) {
        let assetID;
        switch (type) {
            case BlockType.Block:
                assetID = this.metadata.blocks[block];
                break;
            case BlockType.Entity:
                assetID = this.metadata.entities[block];
                break;
            default:
                throw `unknown block type ${type}`;
        }
        if (assetID === undefined) {
            return NoTextureID;
        }
        // No positions, just use the one asset.
        if (typeof assetID == "string") {
            return assetID;
        }
        return this.positionTexture(assetID, position) || NoTextureID;
    }
    // positionTexture returns the texture for the given position.
    positionTexture(textures, position = BlockPosition.Floating) {
        // Try and search for the exact position.
        if (textures[position] !== undefined) {
            return textures[position];
        }
        // Seek for the closest edge and use that texture instead. See the
        // BlockEdges array for more information.
        for (const edge of BlockEdges) {
            if (position != edge && (position & edge) != 0 && edge && textures[edge] !== undefined) {
                return textures[edge];
            }
        }
    }
    blockPosition(pos, block) {
        const w = this.width - 1;
        const h = this.height - 1;
        let position = BlockPosition.Floating;
        // These checks may seem counter-intuitive, but it makes sense. If we
        // have the same block on the left, then we must be on the right, etc.
        if (pos.x >= w || this.lines[pos.y][pos.x + 1] == block) {
            position |= BlockPosition.Left;
        }
        if (pos.x <= 0 || this.lines[pos.y][pos.x - 1] == block) {
            position |= BlockPosition.Right;
        }
        if (pos.y >= h || this.lines[pos.y + 1][pos.x] == block) {
            position |= BlockPosition.Top;
        }
        if (pos.y <= 0 || this.lines[pos.y - 1][pos.x] == block) {
            position |= BlockPosition.Bottom;
        }
        return position;
    }
    // blockAttributes looks up the attributes of a block.
    blockAttributes(block) {
        let mods = [];
        if (this.metadata.blockMods) {
            mods = this.metadata.blockMods[block] || [];
        }
        if (block == " " && !mods.includes("air")) {
            mods = mods.slice();
            mods.push("air");
        }
        return mods;
    }
    // findBlock seeks for the first position with this block. Use this for
    // blocks that are known to only appear once.
    findBlock(block, x = 0, y = 0, w = this.width, h = this.height) {
        const x1 = x;
        const y1 = y;
        const x2 = x + w;
        const y2 = y + h;
        for (let y = y1; y < y2; y++) {
            const line = this.lines[y];
            for (let x = x1; x < x2; x++) {
                const pos = { x, y };
                const current = line[x];
                if (block == current) {
                    return pos;
                }
            }
        }
    }
    // blockWithAsset finds the block with the given asset ID. This is useful
    // for assets like "player".
    entityWithAsset(asset) {
        for (const [block, assetID] of Object.entries(this.metadata.entities)) {
            if (assetID == asset) {
                return block;
            }
        }
    }
    // at looks up a block's object by the coordinates.
    at(pos, type = BlockType.Block) {
        // Access Y first, X last. Y describes the line, while X is the offset
        // within that line.
        const block = this.lines[pos.y][pos.x];
        const position = this.blockPosition(pos, block);
        return this.blockAsset(block, position, type) || NoTextureID;
    }
    // iterate calls fn on the given bounds of the map. The function does some
    // precalculations to ensure that iterations can be done slightly faster
    // than regularly calling map.at().
    iterate(fn, blockType = BlockType.Block, x = 0, y = 0, w = this.width, h = this.height) {
        let blocks;
        switch (blockType) {
            case BlockType.Block:
                blocks = this.metadata.blocks;
                break;
            case BlockType.Entity:
                blocks = this.metadata.entities;
                break;
            default:
                throw `unknown block type ${blockType}`;
        }
        const blockAttributes = {};
        for (const block in blocks) {
            blockAttributes[block] = this.blockAttributes(block);
        }
        const x1 = x;
        const y1 = y;
        const x2 = x + w;
        const y2 = y + h;
        for (let y = y1; y < y2; y++) {
            const line = this.lines[y];
            for (let x = x1; x < x2; x++) {
                const pos = { x, y };
                const block = line[x];
                const position = this.blockPosition(pos, block);
                let asset = blocks[block];
                if (asset == undefined) {
                    continue;
                }
                if (typeof asset != "string") {
                    asset = this.positionTexture(asset, position);
                }
                const mods = [] || blockAttributes[block];
                fn(pos, block, asset, mods);
            }
        }
    }
    iterateEntities(fn) {
        for (const block in this.metadata.entities) {
            this.iterateEntity(block, fn);
        }
    }
    // iterateEntity iterates over the entire map for all entities with the
    // given block. If the block is not defined, then this function does
    // nothing.
    iterateEntity(block, fn) {
        const asset = this.blockAsset(block, BlockPosition.Floating, BlockType.Entity);
        if (!asset) {
            return;
        }
        const mods = this.blockAttributes(block);
        for (let y = 0; y < this.height; y++) {
            const line = this.lines[y];
            for (let x = line.indexOf(block, 0); x != -1; x = line.indexOf(block, x + 1)) {
                fn({ x, y }, block, asset, mods);
            }
        }
    }
    // attribute looks up any attribute from the metadata attribute this. The
    // user should cast the returned value to another known type.
    attribute(key) {
        return this.metadata.attributes[key];
    }
    // withinGoal returns true if the given pair of coordinates is within any
    // goal.
    withinGoal(pos) {
        return this.goals.includes(this.lines[pos.y][pos.x]);
    }
}
