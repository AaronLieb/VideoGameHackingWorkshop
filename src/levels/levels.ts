import * as map from "/src/common/map.ts";
import * as level from "/src/level.ts";
import * as level1 from "/src/levels/01.ts";

// Info contains all known visible levels' information.
export const Info: level.Info[] = [
    level1.Info,
];

// Maps contains all known maps.
export const Maps: map.LevelMap[] = Info.map((info) => info.map);
