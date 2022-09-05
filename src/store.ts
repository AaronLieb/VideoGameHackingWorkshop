import { Leaderboards, Score } from "/src/common/types.ts";

// Storer describes a store for all of the game data.
export interface Storer {
    close(): Promise<void>;
    setScore(level: number, score: Score): Promise<void>;
    leaderboards(): Promise<Leaderboards>;
}
