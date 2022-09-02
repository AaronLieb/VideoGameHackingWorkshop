// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const TickRate = 15;
const TickDuration = 1000 / 15;
var BlockType;
(function(BlockType1) {
    BlockType1[BlockType1["Block"] = 0] = "Block";
    BlockType1[BlockType1["EntityBlock"] = 1] = "EntityBlock";
})(BlockType || (BlockType = {}));
export { TickRate as TickRate };
export { TickDuration as TickDuration };
export { BlockType as BlockType };
