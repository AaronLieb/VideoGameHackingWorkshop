import { Command } from "/src/common/types.ts";
import * as map from "/src/common/map.ts";
import * as ws from "/src/ws.ts";

export interface Session {
    setScore(level: number, time: number): Promise<void>;
}

// Level describes a level with all its server logic.
export class Level {
    readonly map: map.Map;
    readonly level: number;
    readonly startsAt: number;
    readonly session: Session;

    private wonAt: number | undefined;

    constructor(s: Session, map: map.Map, level: number) {
        this.map = map;
        this.level = level;
        this.startsAt = Date.now();
        this.session = s;
    }

    destroy() {
        // reserved for future use
    }

    handleCommand(server: ws.Server, cmd: Command) {
        switch (cmd.type) {
            case "MOVE": {
                if (!this.wonAt) {
                    const pos = cmd.d.position;
                    if (this.map.withinGoal(pos)) {
                        this.wonAt = Date.now();
                        const time = this.wonAt - this.startsAt;

                        this.session.setScore(this.level, time);
                        server.send({
                            type: "VICTORY",
                            d: {
                                level: this.level,
                                time: time,
                            },
                        });
                    }
                }

                break;
            }
        }
    }
}
