import { Command, PersonalScore } from "/src/common/types.ts";
import * as ws from "/src/ws.ts";
import * as store from "/src/store.ts";
import * as score from "/src/common/score.ts";
import * as level from "/src/levels/level.ts";
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

    async handleCommand(server: ws.Server, cmd: Command) {
        switch (cmd.type) {
            case "_open": {
                this.ws = server;

                try {
                    await this.#sayHello();
                } catch (err) {
                    console.error("cannot say hello:", err);
                    this.ws.send({
                        type: "WARNING",
                        d: { message: `cannot say hello: ${err}` },
                    });
                }

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

                if (!cmd.d.level) {
                    return;
                }

                const levelInfo = levels.Info.get(cmd.d.level);
                if (!levelInfo) {
                    throw `unknown level ${cmd.d.level}`;
                }

                this.currentLevel = levelInfo.new(this);

                server.send({
                    type: "LEVEL_JOINED",
                    d: {
                        level: levelInfo.number,
                        info: level.ConvertToLevelInfo(levelInfo),
                        raw: levelInfo.map.raw,
                        metadata: levelInfo.map.metadata,
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

            const bestTimes = await this.store.userBestTimes(this.username);
            const playerScore = score.CalculateScores(bestTimes, levels.Info);
            await this.store.setGlobalScore(this.username, playerScore);

            const globalLeaderboard = await this.store.globalLeaderboard();
            this.wsPool.emit({
                type: "GLOBAL_LEADERBOARD_UPDATE",
                d: globalLeaderboard,
            });
        }
    }

    async #sayHello() {
        this.ws.send({
            type: "HELLO",
            d: {
                username: this.username,
                levels: levels.LevelInfo(),
            },
        });

        const leaderboards = await this.store.leaderboards();
        this.ws.send({
            type: "LEADERBOARD_UPDATE",
            d: leaderboards,
        });

        // userBestTimes doesn't have ranking for performance reasons, so we
        // just use userBestTime, since sayHello is only done once per connect.
        const personalScores: PersonalScore[] = [];
        for (const level of levels.LevelInfo()) {
            const score = await this.store.userBestTime(level.number, this.username);
            if (score) personalScores.push(score);
        }
        this.ws.send({
            type: "PERSONAL_SCORES",
            d: personalScores,
        });

        const globalLeaderboard = await this.store.globalLeaderboard();
        this.ws.send({
            type: "GLOBAL_LEADERBOARD_UPDATE",
            d: globalLeaderboard,
        });
    }
}
