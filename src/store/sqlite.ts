import { Leaderboards, LevelLeaderboard, LevelScore } from "/src/common/types.ts";
import { sqlite } from "/src/deps.ts";
import * as store from "/src/store.ts";

const schemas = [`
PRAGMA strict = ON;

CREATE TABLE leaderboards (
	level INTEGER NOT NULL,
	username TEXT NOT NULL,
	best_time INTEGER NOT NULL,

	UNIQUE(level, username)
);
`];

const leaderboardLimit = 15;

export async function Open(path: string): Promise<SQLiteStore> {
    try {
        return await open(path);
    } catch (err) {
        err.message = `cannot open sqlite3 CLI: ${err.message}`;
        throw err;
    }
}

async function open(path: string): Promise<SQLiteStore> {
    const db = await sqlite.Shell.create({ databasePath: path });

    // I'm fairly sure this is 0 by default.
    const [jsonRow] = await db.queryAll("PRAGMA user_version");
    const row = jsonRow as {
        user_version: number;
    };

    for (let i = row.user_version; i < schemas.length; i++) {
        await db.execute(schemas[i]);
    }

    await db.execute(`PRAGMA user_version = ${schemas.length}`);

    const store = new SQLiteStore(db);
    return store;
}

export class SQLiteStore implements store.Storer {
    constructor(private readonly db: sqlite.Shell) {}

    close(): Promise<void> {
        this.db.close();
        return new Promise((done) => done());
    }

    async setScore(level: number, score: LevelScore): Promise<boolean> {
        const changedRows = await this.db.queryAll(
            `
			INSERT INTO leaderboards (level, username, best_time) VALUES (?, ?, ?)
				ON CONFLICT(username) DO
					UPDATE SET best_time = excluded.best_time
					WHERE best_time > excluded.best_time
				RETURNING *;
			`,
            [level, score.username, score.bestTime],
        );
        return changedRows.length > 0;
    }

    async leaderboard(level: number): Promise<LevelLeaderboard> {
        const rows = this.db.query(
            `
			SELECT username, best_time FROM leaderboards
				WHERE level = ?
				ORDER BY best_time DESC
				LIMIT ${leaderboardLimit};
			`,
            [level],
        );

        const leaderboard: LevelLeaderboard = {
            level: level,
            scores: [],
        };

        for await (const row of rows) {
            const score = row as {
                username: string;
                best_time: number;
            };
            leaderboard.scores.push({
                username: score.username,
                bestTime: score.best_time,
            });
        }

        // Sort by descending best time (best time first).
        leaderboard.scores.sort((s1, s2) => s2.bestTime - s1.bestTime);

        return leaderboard;
    }

    async leaderboards(): Promise<Leaderboards> {
        const rows = await this.db.queryAll(`SELECT DISTINCT level from leaderboards`);
        const levels = rows.map(({ level }) => level as number);

        const leaderboardsAsync = levels.map((level) => this.leaderboard(level));
        const leaderboards = await Promise.all(leaderboardsAsync);

        // Sort by ascending levels.
        leaderboards.sort((l1, l2) => l1.level - l2.level);

        return leaderboards;
    }
}
