// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

var BlockType;
(function(BlockType1) {
    BlockType1[BlockType1["Block"] = 0] = "Block";
    BlockType1[BlockType1["EntityBlock"] = 1] = "EntityBlock";
})(BlockType || (BlockType = {}));
const NoTextureID = "notexture";
const BlankID = "";
function Iterate(map, fn, blockType = BlockType.Block, x = 0, y = 0, w = map.width, h = map.height) {
    let blocks;
    switch(blockType){
        case BlockType.Block:
            blocks = map.metadata.blocks;
            break;
        case BlockType.EntityBlock:
            blocks = map.metadata.entities;
            break;
        default:
            throw `unknown block type ${blockType}`;
    }
    const blockAttributes = {};
    for(const block in blocks){
        blockAttributes[block] = map.blockAttributes(block);
    }
    const x1 = x;
    const y1 = y;
    const x2 = x + w;
    const y2 = y + h;
    for(let y3 = y1; y3 < y2; y3++){
        const line = map.lines[y3];
        for(let x = x1; x < x2; x++){
            const block = line[x];
            const objID = blocks[block] !== undefined ? blocks[block] : NoTextureID;
            const mods = blockAttributes[block];
            fn(x, y3, objID, mods);
        }
    }
}
class Map {
    lines;
    raw;
    metadata;
    width;
    height;
    constructor(raw, metadata){
        if (!metadata.blocks["background"]) {
            throw `map metadata is missing "background"`;
        }
        let width = 0;
        for (const line of raw){
            width = Math.max(width, line.length);
        }
        this.lines = raw.split("\n");
        for(let i = 0; i < this.lines.length; i++){
            const missing = this.lines[i].length - width;
            if (missing > 0) {
                this.lines[i] += " ".repeat(missing);
            }
        }
        this.raw = this.lines.join("\n");
        this.metadata = metadata;
        this.width = width;
        this.height = raw.length;
    }
    block(block, type = BlockType.Block) {
        let objectID;
        switch(type){
            case BlockType.Block:
                objectID = this.metadata.blocks[block];
                break;
            case BlockType.EntityBlock:
                objectID = this.metadata.entities[block];
                break;
            default:
                throw `unknown block type ${type}`;
        }
        if (objectID !== undefined) return objectID;
        return NoTextureID;
    }
    blockAttributes(block) {
        let mods = [];
        if (this.metadata.blockMods) {
            mods = this.metadata.blockMods[block] || [];
        }
        if (block == "background" && !mods.includes("air")) {
            mods = mods.slice();
            mods.push("air");
        }
        return mods;
    }
    at(pos, type = BlockType.Block) {
        const block = this.lines[pos.y][pos.x];
        return this.block(block, type);
    }
    attribute(key) {
        return this.metadata.attributes[key];
    }
    withinGoal(pos) {
        for (const goal of this.metadata.goals){
            if (goal.from.x <= pos.x && pos.x <= goal.to.x && goal.from.y <= pos.y && pos.y <= goal.to.y) {
                return true;
            }
        }
        return false;
    }
}
export { NoTextureID as NoTextureID };
export { BlankID as BlankID };
export { Iterate as Iterate };
export { Map as Map };
