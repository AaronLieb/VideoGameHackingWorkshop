import * as map from "/src/common/map.ts";
import * as level from "/src/level.ts";
import * as level1 from "/src/levels/01.ts";

// Levels contains all known visible levels.
export const Levels: typeof level.Level[] = [
    level1.Level,
];

// Maps contains all known maps.
export const Maps: map.LevelMap[] = Levels.map((level) => level.map);
