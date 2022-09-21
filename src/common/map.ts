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
    RawMap,
    Vector,
} from "/src/common/types.ts";

export const NoTextureID: AssetID = "notexture";
export const BlankTextureID: AssetID = ""; // treat as all transparency

// AssetPath returns the absolute path to the object's asset given the asset ID.
export function AssetPath(id: AssetID): AssetPath {
    if (id === "") return "";
    return "/public/assets/" + id + ".png";
}

const positionTopBottom = BlockPosition.Top | BlockPosition.Bottom;
const positionLeftRight = BlockPosition.Left | BlockPosition.Right;

// LevelMap describes an entire map of a level.
export class LevelMap {
    readonly lines: string[];
    readonly raw: RawMap;
    readonly goals: Block[];
    readonly metadata: MapMetadata; // avoid using this
    readonly width: number; // calculated
    readonly height: number;

    constructor(raw: RawMap, metadata: MapMetadata) {
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
    blockAsset(block: Block, position = BlockPosition.Floating, type = BlockType.Block): AssetID | undefined {
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
            return NoTextureID;
        }

        // No positions, just use the one asset.
        if (typeof assetID == "string") {
            return assetID;
        }

        return this.positionTexture(assetID, position) || NoTextureID;
    }

    // positionTexture returns the texture for the given position.
    positionTexture(textures: BlockTextures, position = BlockPosition.Floating): AssetID | undefined {
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

    blockPosition(pos: Vector, block: Block): BlockPosition {
        const w = this.width - 1;
        const h = this.height - 1;

        let position = BlockPosition.Middle;
        // These checks may seem counter-intuitive, but it makes sense. If we
        // have the same block on the left, then we must be on the right, etc.
        if (pos.x < w && this.lines[pos.y][pos.x + 1] != block) position &= ~BlockPosition.Left;
        if (pos.x > 0 && this.lines[pos.y][pos.x - 1] != block) position &= ~BlockPosition.Right;
        if (pos.y < h && this.lines[pos.y + 1][pos.x] != block) position &= ~BlockPosition.Top;
        if (pos.y > 0 && this.lines[pos.y - 1][pos.x] != block) position &= ~BlockPosition.Bottom;

        // Resolve conflicts when both Top and Bottom are true or both Left and
        // Right are true. They should cancel out.
        if (position != BlockPosition.Middle) {
            if ((position & positionTopBottom) == positionTopBottom) position &= ~positionTopBottom;
            if ((position & positionLeftRight) == positionLeftRight) position &= ~positionLeftRight;
        }

        return position;
    }

    // blockAttributes looks up the attributes of a block.
    blockMods(block: Block): BlockModifier[] {
        let mods: BlockModifier[] = [];
        if (this.metadata.blockMods) {
            mods = this.metadata.blockMods[block] || [];
        }

        if (block == " " && !mods.includes("air")) {
            mods = mods.slice();
            mods.push("air");
        }
        return mods;
    }

    blockType(block: Block): BlockType | undefined {
        if (this.metadata.blocks[block]) {
            return BlockType.Block;
        }
        if (this.metadata.entities[block]) {
            return BlockType.Entity;
        }
    }

    // findBlock seeks for the first position with this block. Use this for
    // blocks that are known to only appear once.
    findBlock(block: Block, x = 0, y = 0, w = this.width, h = this.height): Vector | undefined {
        const x1 = x;
        const y1 = y;
        const x2 = x + w;
        const y2 = y + h;

        for (let y = y1; y < y2; y++) {
            const line = this.lines[y];
            for (let x = x1; x < x2; x++) {
                const pos = { x, y };
                const current = line[x];
                if (block == current) return pos;
            }
        }
    }

    // blockWithAsset finds the block with the given asset ID. This is useful
    // for assets like "player".
    entityWithAsset(asset: AssetID): Block | undefined {
        for (const [block, assetID] of Object.entries(this.metadata.entities)) {
            if (assetID == asset) return block;
        }
    }

    // at looks up a block's object by the coordinates.
    at(pos: Vector): Block | undefined {
        const line = this.lines[Math.round(pos.y)];
        if (line) return line[Math.round(pos.x)];
    }

    assetAt(pos: Vector, type = BlockType.Block): AssetID {
        // Access Y first, X last. Y describes the line, while X is the offset
        // within that line.
        const block = this.at(pos);
        if (!block) return BlankTextureID;

        const position = this.blockPosition(pos, block);
        return this.blockAsset(block, position, type) || NoTextureID;
    }

    // iterate calls fn on the given bounds of the map. The function does some
    // precalculations to ensure that iterations can be done slightly faster
    // than regularly calling map.at().
    iterate(
        fn: (pos: Vector, block: Block, asset: AssetID, mods: BlockModifier[]) => void,
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
            blockAttributes[block] = this.blockMods(block);
        }

        const x1 = x;
        const y1 = y;
        const x2 = x + w;
        const y2 = y + h;

        for (let y = y1; y < y2; y++) {
            const line = this.lines[y];
            for (let x = x1; x < x2; x++) {
                const block = line[x];
                if (block == " ") {
                    continue;
                }

                const pos = { x, y };
                const position = this.blockPosition(pos, block);

                let asset: AssetID | BlockTextures | undefined = blocks[block];
                if (asset === undefined || asset === "") {
                    continue;
                }
                if (typeof asset != "string") {
                    asset = this.positionTexture(asset, position);
                }

                const mods = [] || blockAttributes[block];

                fn(pos, block, asset as string, mods);
            }
        }
    }

    iterateEntities(
        fn: (pos: Vector, block: Block, asset: AssetID, mods: BlockModifier[]) => void,
    ) {
        for (const block in this.metadata.entities) {
            this.iterateEntity(block, fn);
        }
    }

    // iterateEntity iterates over the entire map for all entities with the
    // given block. If the block is not defined, then this function does
    // nothing.
    iterateEntity(
        block: Block,
        fn: (pos: Vector, block: Block, asset: AssetID, mods: BlockModifier[]) => void,
    ) {
        const asset = this.blockAsset(block, BlockPosition.Floating, BlockType.Entity);
        if (!asset) return;

        const mods = this.blockMods(block);

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
        if (this.metadata.attributes) return this.metadata.attributes[key];
        return undefined;
    }

    // withinGoal returns true if the given pair of coordinates is within any
    // goal.
    withinGoal(pos: Vector): boolean {
        return this.goals.includes(this.lines[pos.y][pos.x]);
    }
}
