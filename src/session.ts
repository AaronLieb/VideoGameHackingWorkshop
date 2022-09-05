import { Command } from "/src/common/types.ts";
import * as ws from "/src/ws.ts";
import * as store from "/src/store.ts";
import * as level from "/src/level.ts";
import * as levels from "/src/levels/levels.ts";

export class Session {
    readonly store: store.Storer;
    readonly username: string;

    private currentLevel: level.Level | undefined;

    constructor(store: store.Storer, username: string) {
        this.store = store;
        this.username = username;
    }

    async handleCommand(server: ws.Server, cmd: Command) {
        switch (cmd.type) {
            case "_open": {
                server.send({
                    type: "HELLO",
                    d: {
                        nLevels: levels.All.length,
                        completedLevels: [],
                    },
                });
                break;
            }
            case "JOIN": {
                if (this.currentLevel) {
                    this.currentLevel.destroy();
                    this.currentLevel = undefined;
                }

                const newLevel = levels.All[cmd.d.level];
                if (!newLevel) {
                    throw `unknown level ${cmd.d.level}`;
                }

                const level = await newLevel(this);
                this.currentLevel = level;

                server.send({
                    type: "MAP_DATA",
                    d: {
                        level: cmd.d.level,
                        map: level.map.raw,
                        metadata: level.map.metadata,
                    },
                });
                break;
            }
        }

        if (this.currentLevel) {
            this.currentLevel.handleCommand(server, cmd);
        }
    }

    async setScore(level: number, time: number) {
        await this.store.setScore(level, {
            username: this.username,
            time: time,
        });
    }
}
