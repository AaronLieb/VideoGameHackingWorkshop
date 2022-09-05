import * as level from "/src/level.ts";
import * as map from "/src/common/map.ts";

const rawMap = `
                                  LLLL
                                LLLLLLLL
                                LLLLLLLLL
                                  LLLLL
                                   WW
                                   WW
        P                          WW
==================================================================
..................................................................
..................................................................
..................................................................`;

const metadata = {
    blocks: {
        background: "air.png",
        "L": "leaf.png",
        "W": "wood.png",
        "=": "ground.png",
        ".": "dirt.png",
    },
    entities: {
        P: "player_spawn",
    },
    goals: [
        {
            from: {
                x: 65,
                y: 0,
            },
            to: {
                x: 66,
                y: 13,
            },
        },
    ],
    attributes: {
        n_jumps: 3,
    },
};

const levelMap = new map.Data(rawMap, metadata);

export class Level extends level.Level {
    constructor(s: level.Session) {
        super(s, levelMap, 1);
    }
}
