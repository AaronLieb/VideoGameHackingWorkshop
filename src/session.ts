import { Command } from "/src/common/types.ts";
import * as ws from "/src/ws.ts";
import * as store from "/src/store.ts";
import * as level from "/src/level.ts";
import * as levels from "/src/levels/levels.ts";

export class Session {
    readonly store: store.Storer;
    readonly username: string;
    readonly wsPool: ws.ServerPool;

    private currentLevel: level.Level | undefined;

    constructor(username: string, d: {
        store: store.Storer;
        wsPool: ws.ServerPool;
    }) {
        this.username = username;
        this.store = d.store;
        this.wsPool = d.wsPool;
    }

    handleCommand(server: ws.Server, cmd: Command) {
        switch (cmd.type) {
            case "_open": {
                server.send({
                    type: "HELLO",
                    d: {
                        username: this.username,
                        levels: levels.Levels.map((level) => ({
                            number: level.number,
                            name: level.levelName,
                            desc: level.levelDesc,
                        })),
                    },
                });
                break;
            }
            case "_close": {
                if (this.currentLevel) {
                    this.currentLevel.destroy();
                    this.currentLevel = undefined;
                }
                break;
            }
            case "JOIN": {
                if (this.currentLevel) {
                    this.currentLevel.destroy();
                    this.currentLevel = undefined;
                }

                const level = levels.Levels[cmd.d.level - 1];
                if (!level) {
                    throw `unknown level ${cmd.d.level}`;
                }

                this.currentLevel = new level(this);

                server.send({
                    type: "LEVEL_JOINED",
                    d: {
                        level: level.number,
                        info: {
                            number: level.number,
                            name: level.levelName,
                            desc: level.levelDesc,
                        },
                        raw: level.map.raw,
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
        const newHiscore = await this.store.setScore(level, {
            username: this.username,
            bestTime: time,
        });

        if (newHiscore) {
            const leaderboard = await this.store.leaderboard(level);
            this.wsPool.emit({
                type: "LEADERBOARD_UPDATE",
                d: [leaderboard],
            });
        }
    }
}
