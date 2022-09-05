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

// Objects listed here are guaranteed to exist.
export const Objects: Record<MapObjectID, AssetPath> = {
    "notexture": "notexture.png",
    "blank": "", // special case, render as alpha
};

// Data describes an entire map.
export class Data {
    readonly raw: RawMap;
    readonly lines: string[];
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

        this.raw = raw;
        this.metadata = metadata;
        this.width = width;
        this.height = raw.length;

        // Ensure that every single map line has a constant width.
        this.lines = raw.split("/");
        for (let i = 0; i < this.lines.length; i++) {
            const missing = this.lines[i].length - width;
            if (missing > 0) {
                this.lines[i] += " ".repeat(missing);
            }
        }
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
        if (objectID) return objectID;
        return Objects["notexture"];
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

    // attribute looks up any attribute from the metadata attribute map. The
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
