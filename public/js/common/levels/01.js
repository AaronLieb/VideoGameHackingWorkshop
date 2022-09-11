import { BlockPosition } from "/public/js/common/types.js";
import * as map from "/public/js/common/map.js";
export const RawMap = `
                                  LLLL
                                LLLLLLLL
                                LLLLLLLLL
                                  LLLLL
                    B              WW                       g
                                   WW                       g
        P                          WW                       G
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`;
export const Metadata = {
    blocks: {
        "L": {
            [BlockPosition.Floating]: "leafm",
            [BlockPosition.Top]: "leaft",
            [BlockPosition.TopLeft]: "leaftl",
            [BlockPosition.TopRight]: "leaftr",
            [BlockPosition.Middle]: "leafm",
            [BlockPosition.Left]: "leafl",
            [BlockPosition.Right]: "leafr",
            [BlockPosition.Bottom]: "leafb",
            [BlockPosition.BottomLeft]: "leafbl",
            [BlockPosition.BottomRight]: "leafbr",
        },
        "W": {
            [BlockPosition.Floating]: "woodl",
            [BlockPosition.Top]: "woodl",
            [BlockPosition.TopLeft]: "woodl",
            [BlockPosition.TopRight]: "woodr",
            [BlockPosition.Middle]: "woodl",
            [BlockPosition.Left]: "woodl",
            [BlockPosition.Right]: "woodr",
            [BlockPosition.Bottom]: "woodl",
            [BlockPosition.BottomLeft]: "woodl",
            [BlockPosition.BottomRight]: "woodr",
        },
        "^": {
            [BlockPosition.Floating]: "grassf",
            [BlockPosition.Top]: "grass",
            [BlockPosition.TopLeft]: "grassl",
            [BlockPosition.TopRight]: "glassr",
            [BlockPosition.Middle]: "dirt",
            [BlockPosition.Left]: "dirtl",
            [BlockPosition.Right]: "dirtr",
            [BlockPosition.Bottom]: "dirtb",
            [BlockPosition.BottomLeft]: "dirtbl",
            [BlockPosition.BottomRight]: "dirtbr",
        },
        "G": "star",
        "g": "",
    },
    entities: {
        "P": "player",
        "B": "ball",
    },
    blockMods: {
        "G": ["air", "goal", "fixed"],
        "g": ["air", "goal"],
    },
    attributes: {},
};
export const Map = new map.Map(RawMap, Metadata);
