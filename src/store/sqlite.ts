import { Leaderboards, Millisecond, Score } from "/src/common/types.ts";
import { sqlite } from "/src/deps.ts";
import * as store from "/src/store.ts";

const schemas = [`
PRAGMA strict = ON;

CREATE TABLE leaderboards (
	level INTEGER NOT NULL,
	username TEXT NOT NULL,
	time INTEGER NOT NULL,

	UNIQUE(level, username)
);
`];

export function New(path: string): SQLiteStore {
    const db = new sqlite.DB(path);

    // I'm fairly sure this is 0 by default.
    const [[userVersion]] = db.query<number[]>("PRAGMA user_version");

    for (let i = userVersion; i < schemas.length; i++) {
        db.query(schemas[i]);
        db.query(`PRAGMA user_version = ${i}`);
    }

    const store = new SQLiteStore(db);
    return store;
}

const leaderboardAge = 30 * 1000; // 30 seconds;

export class SQLiteStore implements store.Storer {
    private leaderboard: Leaderboards | undefined;
    private leaderboardLastFetched = 0;

    constructor(private readonly db: sqlite.DB) {}

    async close() {
        await new Promise(() => {
            this.db.close(true);
        });
    }

    async setScore(level: number, score: Score) {
        await new Promise(() => {
            this.leaderboard = undefined;
            this.db.query(
                "REPLACE INTO leaderboards (level, username, time) VALUES (?, ?, ?)",
                [level, score.username, score.time],
            );
        });
    }

    async leaderboards(): Promise<Leaderboards> {
        return await new Promise((done) => {
            if (this.leaderboard && (this.leaderboardLastFetched + leaderboardAge) > Date.now()) {
                done(this.leaderboard);
                return;
            }

            const leaderboards: Record<number, Score[]> = {};

            const rs = this.db.query<[number, string, Millisecond]>("SELECT FROM leaderboards");
            for (const [level, username, time] of rs) {
                let score = leaderboards[level];
                if (score === undefined) {
                    score = [];
                    leaderboards[level] = score;
                }

                score.push({
                    username: username,
                    time: time,
                });

                this.leaderboard = leaderboards;
                this.leaderboardLastFetched = Date.now();
                done(leaderboards);
            }
        });
    }
}
