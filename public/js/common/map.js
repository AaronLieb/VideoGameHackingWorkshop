// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

var BlockType;
(function(BlockType1) {
    BlockType1[BlockType1["Block"] = 0] = "Block";
    BlockType1[BlockType1["EntityBlock"] = 1] = "EntityBlock";
})(BlockType || (BlockType = {}));
const Objects = {
    "notexture": "notexture.png",
    "blank": ""
};
class Data {
    raw;
    lines;
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
        this.raw = raw;
        this.metadata = metadata;
        this.width = width;
        this.height = raw.length;
        this.lines = raw.split("/");
        for(let i = 0; i < this.lines.length; i++){
            const missing = this.lines[i].length - width;
            if (missing > 0) {
                this.lines[i] += " ".repeat(missing);
            }
        }
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
        if (objectID) return objectID;
        return Objects["notexture"];
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
export { Objects as Objects };
export { Data as Data };
