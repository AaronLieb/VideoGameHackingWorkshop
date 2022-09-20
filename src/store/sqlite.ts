import { GlobalScore, Leaderboards, LevelLeaderboard, Millisecond, PersonalScore } from "/src/common/types.ts";
import { sqlite } from "/src/deps.ts";
import * as store from "/src/store.ts";

const schemas = [`
PRAGMA strict = ON;
PRAGMA synchronous = FULL;

CREATE TABLE leaderboards (
	level INTEGER NOT NULL,
	username TEXT NOT NULL REFERENCES players(username) ON UPDATE CASCADE,
	best_time INTEGER NOT NULL,

	UNIQUE(level, username)
);

CREATE TABLE players (
	username TEXT PRIMARY KEY,
	global_score FLOAT NOT NULL DEFAULT 0
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

    async close(): Promise<void> {
        await this.db.close();
    }

    async initUser(username: string): Promise<void> {
        await this.db.execute(
            `
			INSERT INTO players (username) VALUES (?)
				ON CONFLICT DO NOTHING;
			`,
            [username],
        );
    }

    async setScore(level: number, username: string, bestTime: Millisecond): Promise<PersonalScore | undefined> {
        // Ensure the user exists.
        await this.initUser(username);

        const changedRows = await this.db.queryAll(
            `
			INSERT INTO leaderboards (level, username, best_time) VALUES (?, ?, ?)
				ON CONFLICT(username) DO
					UPDATE SET best_time = excluded.best_time
					WHERE best_time > excluded.best_time
				RETURNING *;
			`,
            [level, username, bestTime],
        );

        if (changedRows.length == 0) {
            return;
        }

        return await this.userBestTime(level, username);
    }

    async setGlobalScore(username: string, globalScore: number): Promise<void> {
        await this.db.execute(
            `REPLACE INTO players (username, global_score) VALUES (?, ?);`,
            [username, globalScore],
        );
    }

    async userBestTime(level: number, username: string): Promise<PersonalScore | undefined> {
        const rows = await this.db.queryAll(
            `
			SELECT * FROM (
				SELECT RANK() OVER (ORDER BY best_time ASC) AS rank, best_time
					FROM leaderboards
					WHERE level = ?
				)
				WHERE username = ?;
			`,
            [level, username],
        );
        if (!rows) {
            return;
        }

        const r = rows[0] as {
            rank: number;
            best_time: number;
        };

        return {
            level: level,
            rank: r.rank,
            bestTime: r.best_time,
        };
    }

    async userBestTimes(username: string): Promise<Map<number, number>> {
        const rows = this.db.query(
            `
			SELECT level, best_time
				FROM leaderboards
				WHERE username = ?;
			`,
            [username],
        );

        const scores = new Map<number, number>();

        for await (const rawRow of rows) {
            const row = rawRow as {
                level: number;
                best_time: number;
            };
            scores.set(row.level, row.best_time);
        }

        return scores;
    }

    async leaderboard(level: number): Promise<LevelLeaderboard> {
        const rows = this.db.query(
            `
			SELECT RANK() OVER (ORDER BY best_time ASC) AS rank, username, best_time
				FROM leaderboards
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
                rank: number;
                username: string;
                best_time: number;
            };
            leaderboard.scores.push({
                rank: score.rank,
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

    async globalLeaderboard(): Promise<GlobalScore[]> {
        const rows = this.db.query(
            `
			SELECT RANK() OVER (ORDER BY global_score DESC) AS rank, username, global_score
				FROM players
				LIMIT 25;
			`,
        );

        const scores: GlobalScore[] = [];

        for await (const rawRow of rows) {
            const row = rawRow as {
                rank: number;
                username: string;
                global_score: number;
            };
            scores.push({
                rank: row.rank,
                username: row.username,
                score: row.global_score,
            });
        }

        return scores;
    }
}
