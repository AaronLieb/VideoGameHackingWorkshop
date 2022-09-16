import * as map from "/src/common/map.ts";
import * as level from "/src/level.ts";
import * as level1 from "/src/levels/01.ts";
import * as level99 from "/src/levels/99.ts";

// Info contains all known visible levels' information.
export const Info = new Map<number, level.Info>();

// Maps contains all known maps.
export const Maps = new Map<number, map.LevelMap>();

// ConvertInfo maps all Info to a list of other types, similarly to calling
// Info.
export function ConvertInfo<T>(f: (_: level.Info) => T | undefined): T[] {
    const values: T[] = [];
    Info.forEach((info) => {
        const v = f(info);
        if (v) {
            values.push(v);
        }
    });
    return values;
}

function addLevel(level: level.Info) {
    Info.set(level.number, level);
    Maps.set(level.number, level.map);
}

addLevel(level1.Info);
addLevel(level99.Info);
