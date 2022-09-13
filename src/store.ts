import { Leaderboards, LevelLeaderboard, LevelScore } from "/src/common/types.ts";

// Storer describes a store for all of the game data.
export interface Storer {
    close(): Promise<void>;
    // setScore returns true if the given score is a new hiscore of the given
    // user.
    setScore(level: number, score: LevelScore): Promise<boolean>;
    // leaderboard returns the given level's leaderboard.
    leaderboard(level: number): Promise<LevelLeaderboard>;
    // leaderboards returns all leaderboards. Probably don't use this.
    leaderboards(): Promise<Leaderboards>;
}
