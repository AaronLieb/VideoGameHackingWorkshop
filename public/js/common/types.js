// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const TickRate = 15;
const TickDuration = 1000 / 15;
const BlockSize = 16;
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
export { TickRate as TickRate };
export { TickDuration as TickDuration };
export { BlockSize as BlockSize };
export { BlockPosition as BlockPosition };
export { BlockEdges as BlockEdges };
export { BlockType as BlockType };
