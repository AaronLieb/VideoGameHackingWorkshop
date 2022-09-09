// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

var BlockPosition;
(function(BlockPosition1) {
    BlockPosition1[BlockPosition1["Floating"] = 0] = "Floating";
    BlockPosition1[BlockPosition1["Top"] = 1] = "Top";
    BlockPosition1[BlockPosition1["Bottom"] = 2] = "Bottom";
    BlockPosition1[BlockPosition1["Left"] = 4] = "Left";
    BlockPosition1[BlockPosition1["Right"] = 8] = "Right";
    BlockPosition1[BlockPosition1["Middle"] = 15] = "Middle";
    BlockPosition1[BlockPosition1["TopLeft"] = 5] = "TopLeft";
    BlockPosition1[BlockPosition1["TopRight"] = 9] = "TopRight";
    BlockPosition1[BlockPosition1["BottomLeft"] = 6] = "BottomLeft";
    BlockPosition1[BlockPosition1["BottomRight"] = 10] = "BottomRight";
})(BlockPosition || (BlockPosition = {}));
const BlockEdges = [
    BlockPosition.Top,
    BlockPosition.Bottom,
    BlockPosition.Left,
    BlockPosition.Right, 
];
var BlockType;
(function(BlockType1) {
    BlockType1[BlockType1["Block"] = 0] = "Block";
    BlockType1[BlockType1["EntityBlock"] = 1] = "EntityBlock";
})(BlockType || (BlockType = {}));
const NoTextureID = "notexture";
const BlankTextureID = "";
function AssetPath(id) {
    if (id === "") return "";
    return "/public/assets/" + id + ".png";
}
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
            const position = map.blockPositionXY(x, y3, block);
            const asset = map.blockAsset(block, position, blockType);
            const mods = blockAttributes[block];
            fn(x, y3, asset, mods);
        }
    }
}
class Map {
    lines;
    raw;
    goals;
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
        this.goals = [];
        for (const [block, mods] of Object.entries(metadata.blockMods)){
            if (mods.includes("goal")) {
                this.goals.push(block);
            }
        }
        this.raw = this.lines.join("\n");
        this.metadata = metadata;
        this.width = width;
        this.height = raw.length;
    }
    blockAsset(block, position = BlockPosition.Floating, type = BlockType.Block) {
        let assetID;
        switch(type){
            case BlockType.Block:
                assetID = this.metadata.blocks[block];
                break;
            case BlockType.EntityBlock:
                assetID = this.metadata.entities[block];
                break;
            default:
                throw `unknown block type ${type}`;
        }
        if (assetID === undefined) {
            if (block === "background") {
                return BlankTextureID;
            }
            return NoTextureID;
        }
        if (typeof assetID == "string") {
            return assetID;
        }
        if (assetID[position] !== undefined) {
            return assetID[position];
        }
        for (const edge of BlockEdges){
            if (position != edge && (position & edge) != 0 && edge && assetID[edge] !== undefined) {
                return assetID[edge];
            }
        }
        return NoTextureID;
    }
    blockPosition(pos, block) {
        return this.blockPositionXY(pos.x, pos.y, block);
    }
    blockPositionXY(x, y, block) {
        const w = this.width;
        const h = this.height;
        let position = BlockPosition.Floating;
        if (x >= w || this.lines[y][x + 1] == block) position |= BlockPosition.Left;
        if (x <= 0 || this.lines[y][x - 1] == block) position |= BlockPosition.Right;
        if (y >= h || this.lines[y + 1][x] == block) position |= BlockPosition.Top;
        if (y <= 0 || this.lines[y - 1][x] == block) position |= BlockPosition.Bottom;
        return position;
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
        const position = this.blockPosition(pos, block);
        return this.blockAsset(block, position, type);
    }
    attribute(key) {
        return this.metadata.attributes[key];
    }
    withinGoal(pos) {
        return this.goals.includes(this.lines[pos.y][pos.x]);
    }
}
export { NoTextureID as NoTextureID };
export { BlankTextureID as BlankTextureID };
export { AssetPath as AssetPath };
export { Iterate as Iterate };
export { Map as Map };
