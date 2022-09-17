import { Command } from "/src/common/types.ts";
import * as ws from "/src/ws.ts";
import * as store from "/src/store.ts";
import * as level from "/src/level.ts";
import * as levels from "/src/levels/levels.ts";

export class Session {
    readonly store: store.Storer;
    readonly username: string;
    readonly wsPool: ws.ServerPool;

    ws: ws.Server = ws.Noop;

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
                this.ws = server;
                server.send({
                    type: "HELLO",
                    d: {
                        username: this.username,
                        levels: levels.ConvertInfo((level) => {
                            if (level.hidden) {
                                return;
                            }

                            return {
                                number: level.number,
                                name: level.name,
                                desc: level.desc,
                            };
                        }),
                    },
                });
                break;
            }
            case "_close": {
                this.ws = ws.Noop;
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

                const level = levels.Info.get(cmd.d.level);
                if (!level) {
                    throw `unknown level ${cmd.d.level}`;
                }

                this.currentLevel = level.new(this);

                server.send({
                    type: "LEVEL_JOINED",
                    d: {
                        level: level.number,
                        info: {
                            number: level.number,
                            name: level.name,
                            desc: level.desc,
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
        const newScore = await this.store.setScore(level, this.username, time);
        if (newScore) {
            this.ws.send({
                type: "PERSONAL_SCORES",
                d: [newScore],
            });

            const leaderboard = await this.store.leaderboard(level);
            this.wsPool.emit({
                type: "LEADERBOARD_UPDATE",
                d: [leaderboard],
            });
        }
    }
}
