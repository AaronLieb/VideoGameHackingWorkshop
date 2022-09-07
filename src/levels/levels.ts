import * as level from "/src/level.ts";
import * as level1 from "/src/levels/01.ts";

export const All = [
    (s: level.Session) => new level1.Level(s),
];
