export const TickRate = 15;
export const TickDuration = 1000 / TickRate;
// BlockSize is the size of one block in pixels. One unit of Position in either
// axis will equal to one block, which should be 16 pixels. The pixels do not
// have to correspond to physical pixels, but all textures should be mapped to
// be about 1:1 and treated as a 16x16 texture.
export const BlockSize = 16;
// BlockPosition forms all the possible positions of a block within itself.
//
// To demonstrate its purposes, here's how it works. Suppose we have the
// following map:
//
//    LLLLLLLL
//    LLLLLLLL
//    LLLLLLLL
//
// We can deduce from this object that some of these blocks are outside, meaning
// their neighbors are not the same block, while the other blocks all have their
// neighbors be the same block. By checking what the neighbor blocks are and in
// what direction, we can deduce the positions of these blocks.
//
// Once we have the position of these blocks, we can map them to different kinds
// of textures (see BlockTextures). This allows designers to naturally design
// maps without necessarily having to design tileable edge textures or have
// different block characters for the same object.
//
// As a side note, if the edge of the block is the map boundary, then it can be
// considered that the block is extending beyond that. For example, if we have
// an L block touching the left boundary, then it is counted as a Middle block,
// not a Left block.
//
// A block with no neighbor is considered floating.
//
// Below is a diagram to help visualize these positions:
//
//                 +----------+
//                 | Floating |
//                 +----------+
//
//   +---------------------------------------+
//   | Top|Left        Top         Top|Right |
//   |                                       |
//   | Left           Middle           Right |
//   |                                       |
//   | Bottom|Left    Bottom    Bottom|Right |
//   +---------------------------------------+
//
export var BlockPosition;
(function (BlockPosition) {
    BlockPosition[BlockPosition["Floating"] = 0] = "Floating";
    BlockPosition[BlockPosition["Top"] = 1] = "Top";
    BlockPosition[BlockPosition["Bottom"] = 2] = "Bottom";
    BlockPosition[BlockPosition["Left"] = 4] = "Left";
    BlockPosition[BlockPosition["Right"] = 8] = "Right";
    BlockPosition[BlockPosition["Middle"] = 15] = "Middle";
    BlockPosition[BlockPosition["TopLeft"] = 5] = "TopLeft";
    BlockPosition[BlockPosition["TopRight"] = 9] = "TopRight";
    BlockPosition[BlockPosition["BottomLeft"] = 6] = "BottomLeft";
    BlockPosition[BlockPosition["BottomRight"] = 10] = "BottomRight";
})(BlockPosition || (BlockPosition = {}));
// BlockEdges contains edge positions.
export const BlockEdges = [
    BlockPosition.Top,
    BlockPosition.Bottom,
    BlockPosition.Left,
    BlockPosition.Right,
];
// BlockType is an enum that describes a block type, which is determined by
// whether the object ID is under metadata.blocks or metadata.entities.
export var BlockType;
(function (BlockType) {
    BlockType[BlockType["Block"] = 0] = "Block";
    BlockType[BlockType["Entity"] = 1] = "Entity";
})(BlockType || (BlockType = {}));
