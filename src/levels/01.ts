import { BlockPosition, MapBackgroundMode, MapMetadata, Vector } from "/src/common/types.ts";
import * as level from "/src/levels/level.ts";
import * as session from "/src/session.ts";
import * as platform from "/src/levels/entity/platform.ts";
import * as entity from "/src/levels/entity/entity.ts";
import * as map from "/src/common/map.ts";

const rawMap = `

             LLL                         
            LLLLL                        
           LLLLLL                        
   -       LLLLLL                        
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
        "-": "grassf",
    },
    blockMods: {
        "G": ["air", "goal", "fixed"],
        "g": ["air", "goal"],
        "-": platform.Entity.mods,
    },
    backgrounds: [
        { asset: "bg3", mode: MapBackgroundMode.Tiled },
        { asset: "bg1", mode: MapBackgroundMode.Tiled },
        { asset: "bg2", mode: MapBackgroundMode.Tiled },
    ],
};

export const Info: level.Info = {
    map: new map.LevelMap(rawMap, metadata),
    number: 1,
    name: "Basics",
    desc: "",
    new: (s: session.Session) => new Level(s),
};

export class Level extends level.Level {
    platforms: platform.Entity[];

    constructor(session: session.Session) {
        super(Info, session);

        this.initializeEntity("P", (pos: Vector) => new entity.Entity("P", pos));
        this.initializeEntity("B", (pos: Vector) => new entity.Entity("B", pos));

        this.platforms = this.initializeEntity("-", (pos: Vector) => new platform.Entity("-", pos));
    }
}
