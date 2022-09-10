import {
    AssetID,
    AssetPath,
    Block,
    BlockEdges,
    BlockModifier,
    BlockPosition,
    BlockTextures,
    BlockType,
    MapMetadata,
    Position,
    RawMap,
} from "/src/common/types.ts";

export const NoTextureID: AssetID = "notexture";
export const BlankTextureID: AssetID = ""; // treat as all transparency

// AssetPath returns the absolute path to the object's asset given the asset ID.
export function AssetPath(id: AssetID): AssetPath {
    if (id === "") return "";
    return "/public/assets/" + id + ".png";
}

// Map describes an entire map.
export class Map {
    readonly lines: string[];
    readonly raw: RawMap;
    readonly goals: Block[];
    readonly metadata: MapMetadata; // avoid using this
    readonly width: number; // calculated
    readonly height: number;

    constructor(raw: RawMap, metadata: MapMetadata) {
        if (metadata.blocks["background"] === undefined) {
            metadata.blocks["background"] = "";
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

        this.goals = [];
        for (const [block, mods] of Object.entries(metadata.blockMods)) {
            if (mods.includes("goal")) {
                this.goals.push(block);
            }
        }

        this.raw = this.lines.join("\n");
        this.metadata = metadata;
        this.width = width;
        this.height = raw.length;
    }

    // block looks up the object data by a block.
    blockAsset(block: Block, position = BlockPosition.Floating, type = BlockType.Block): AssetID {
        let assetID: AssetID | BlockTextures | undefined;

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
            if (block === "background") {
                return BlankTextureID;
            }
            return NoTextureID;
        }

        // No positions, just use the one asset.
        if (typeof assetID == "string") {
            return assetID;
        }

        // Try and search for the exact position.
        if (assetID[position] !== undefined) {
            return assetID[position];
        }

        // Seek for the closest edge and use that texture instead. See the
        // BlockEdges array for more information.
        for (const edge of BlockEdges) {
            if (position != edge && (position & edge) != 0 && edge && assetID[edge] !== undefined) {
                return assetID[edge];
            }
        }

        // Fallback.
        return NoTextureID;
    }

    blockPosition(pos: Position, block: Block): BlockPosition {
        return this.blockPositionXY(pos, block);
    }

    blockPositionXY(pos: Position, block: Block): BlockPosition {
        const w = this.width;
        const h = this.height;

        let position = BlockPosition.Floating;
        // These checks may seem counter-intuitive, but it makes sense. If we
        // have the same block on the left, then we must be on the right, etc.
        if (pos.x >= w || this.lines[pos.y][pos.x + 1] == block) position |= BlockPosition.Left;
        if (pos.x <= 0 || this.lines[pos.y][pos.x - 1] == block) position |= BlockPosition.Right;
        if (pos.y >= h || this.lines[pos.y + 1][pos.x] == block) position |= BlockPosition.Top;
        if (pos.y <= 0 || this.lines[pos.y - 1][pos.x] == block) position |= BlockPosition.Bottom;

        return position;
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
    at(pos: Position, type = BlockType.Block): AssetID {
        // Access Y first, X last. Y describes the line, while X is the offset
        // within that line.
        const block = this.lines[pos.y][pos.x];
        const position = this.blockPosition(pos, block);
        return this.blockAsset(block, position, type);
    }

    // iterate calls fn on the given bounds of the map. The function does some
    // precalculations to ensure that iterations can be done slightly faster
    // than regularly calling map.at().
    iterate(
        fn: (pos: Position, block: Block, asset: AssetID, mods: BlockModifier[]) => void,
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
            case BlockType.Entity:
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
                const pos = { x, y };
                const block = line[x];
                const position = this.blockPositionXY(pos, block);
                const asset = this.blockAsset(block, position, blockType);
                const mods = blockAttributes[block];
                fn(pos, block, asset, mods);
            }
        }
    }

    iterateEntities(
        fn: (pos: Position, block: Block, asset: AssetID, mods: BlockModifier[]) => void,
    ) {
        for (const block in this.metadata.entities) {
            this.iterateEntity(block, fn);
        }
    }

    iterateEntity(
        block: Block,
        fn: (pos: Position, block: Block, asset: AssetID, mods: BlockModifier[]) => void,
    ) {
        const asset = this.blockAsset(block, BlockPosition.Floating, BlockType.Entity);
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
    attribute(key: string): unknown {
        return this.metadata.attributes[key];
    }

    // withinGoal returns true if the given pair of coordinates is within any
    // goal.
    withinGoal(pos: Position): boolean {
        return this.goals.includes(this.lines[pos.y][pos.x]);
    }
}
