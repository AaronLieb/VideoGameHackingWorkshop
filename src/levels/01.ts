import { BlockPosition, MapMetadata, Vector } from "/src/common/types.ts";
import * as level from "/src/level.ts";
import * as entity from "/src/common/entity.ts";
import * as map from "/src/common/map.ts";

const rawMap = `

             LLL                         
            LLLLL                        
           LLLLLL                        
           LLLLLL                        
            LLLL                         
        B    WW                                             g
             WW                                             g
   P    f    WW                                             G
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`;

const metadata: MapMetadata = {
    blocks: {
        "L": {
            [BlockPosition.Floating]: "leafm",
            [BlockPosition.Top]: "leaft",
            [BlockPosition.TopLeft]: "leaftl",
            [BlockPosition.TopRight]: "leaftr",
            [BlockPosition.Middle]: "leafm",
            [BlockPosition.Left]: "leafl",
            [BlockPosition.Right]: "leafr",
            [BlockPosition.Bottom]: "woodtl",
            [BlockPosition.BottomLeft]: "leafbl",
            [BlockPosition.BottomRight]: "leafbr",
        },
        "W": {
            [BlockPosition.Floating]: "woodl",
            [BlockPosition.Top]: "woodl",
            [BlockPosition.TopLeft]: "woodl",
            [BlockPosition.TopRight]: "woodl",
            [BlockPosition.Middle]: "woodl",
            [BlockPosition.Left]: "woodl",
            [BlockPosition.Right]: "woodl",
            [BlockPosition.Bottom]: "woodl",
            [BlockPosition.BottomLeft]: "woodl",
            [BlockPosition.BottomRight]: "woodl",
        },
        "^": {
            [BlockPosition.Floating]: "grassf",
            [BlockPosition.Top]: "grass",
            [BlockPosition.TopLeft]: "grassl",
            [BlockPosition.TopRight]: "grassr",
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
        "P": "player", // handle this in the engine
        "B": "ball",
        "f": "frank",
    },
    blockMods: {
        "G": ["air", "goal", "fixed"],
        "g": ["air", "goal"],
    },
    backgrounds: [
        { asset: "bg3", mode: "tiled" },
        { asset: "bg1", mode: "tiled" },
        { asset: "bg2", mode: "tiled" },
    ],
};

export class Level extends level.Level {
    static readonly map = new map.LevelMap(rawMap, metadata);
    static readonly number = 1;
    static readonly levelName = "Basics";
    static readonly levelDesc = "";

    constructor(readonly session: level.Session) {
        super(session);
        super.map = Level.map;

        this.initializeEntity("P", (pos: Vector) => new entity.Player("P", pos));
        this.initializeEntity("B", (pos: Vector) => new entity.Entity("B", pos));
    }
}
