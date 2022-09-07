import {
    AssetPath,
    Block,
    BlockModifier,
    BlockType,
    MapMetadata,
    MapObjectID,
    Position,
    RawMap,
} from "/src/common/types.ts";

export const NoTextureID: AssetPath = "notexture";
export const BlankID: AssetPath = ""; // treat as all transparency

// Map describes an entire map.
export class Map {
    readonly lines: string[];
    readonly raw: RawMap;
    readonly metadata: MapMetadata; // avoid using this
    readonly width: number; // calculated
    readonly height: number;

    constructor(raw: RawMap, metadata: MapMetadata) {
        if (!metadata.blocks["background"]) {
            throw `map metadata is missing "background"`;
        }

        let width = 0;
        for (const line of raw) {
            width = Math.max(width, line.length);
        }

        // Ensure that every single map line has a constant width.
        this.lines = raw.split("\n");
        for (let i = 0; i < this.lines.length; i++) {
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

    // block looks up the object data by a block.
    block(block: Block, type = BlockType.Block): MapObjectID {
        let objectID: MapObjectID | undefined;
        switch (type) {
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

    // blockAttributes looks up the attributes of a block.
    blockAttributes(block: Block): BlockModifier[] {
        let mods: BlockModifier[] = [];
        if (this.metadata.blockMods) {
            mods = this.metadata.blockMods[block] || [];
        }

        if (block == "background" && !mods.includes("air")) {
            mods = mods.slice();
            mods.push("air");
        }
        return mods;
    }

    // at looks up a block's object by the coordinates.
    at(pos: Position, type = BlockType.Block): MapObjectID {
        // Access Y first, X last. Y describes the line, while X is the offset
        // within that line.
        const block: Block = this.lines[pos.y][pos.x];
        return this.block(block, type);
    }

    // iterate calls fn on the given bounds of the map. The function does some
    // precalculations to ensure that iterations can be done slightly faster
    // than regularly calling map.at().
    iterate(
        fn: (x: number, y: number, asset: AssetID, mods: BlockModifier[]) => void,
        blockType = BlockType.Block,
        x = 0,
        y = 0,
        w = this.width,
        h = this.height,
    ) {
        let blocks: Record<Block, AssetID | BlockTextures>;

        switch (blockType) {
            case BlockType.Block:
                blocks = this.metadata.blocks;
                break;
            case BlockType.EntityBlock:
                blocks = this.metadata.entities;
                break;
            default:
                throw `unknown block type ${blockType}`;
        }

        const blockAttributes: Record<Block, BlockModifier[]> = {};
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
                const block = line[x];
                const position = this.blockPositionXY(x, y, block);
                const asset = this.blockAsset(block, position, blockType);
                const mods = blockAttributes[block];
                fn(x, y, asset, mods);
            }
        }
    }

    // attribute looks up any attribute from the metadata attribute this. The
    // user should cast the returned value to another known type.
    attribute(key: string): unknown {
        return this.metadata.attributes[key];
    }

    // withinGoal returns true if the given pair of coordinates is within any
    // goal.
    withinGoal(pos: Position): boolean {
        for (const goal of this.metadata.goals) {
            if (
                goal.from.x <= pos.x && pos.x <= goal.to.x &&
                goal.from.y <= pos.y && pos.y <= goal.to.y
            ) {
                return true;
            }
        }
        return false;
    }
}
