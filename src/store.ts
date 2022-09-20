import { GlobalScore, Leaderboards, LevelLeaderboard, Millisecond, PersonalScore } from "/src/common/types.ts";

// Storer describes a store for all of the game data.
export interface Storer {
    close(): Promise<void>;
    // userBestTime gets the score of the given user and level.
    userBestTime(level: number, username: string): Promise<PersonalScore | undefined>;
    // userBestTimes gets all the scores of the given user. It should return a
    // map of level number to the best time.
    userBestTimes(username: string): Promise<Map<number, number>>;
    // setScore returns the new PersonalScore if the given score is a new high
    // score of the given user.
    setScore(level: number, username: string, bestTime: Millisecond): Promise<PersonalScore | undefined>;
    // setGlobalScore sets the user's global score. This should ideally be
    // called right after userBestTimes().
    setGlobalScore(username: string, globalScore: number): Promise<void>;
    // leaderboard returns the given level's leaderboard.
    leaderboard(level: number): Promise<LevelLeaderboard>;
    // leaderboards returns all leaderboards. Probably don't use this.
    leaderboards(): Promise<Leaderboards>;
    // globalLeaderboard fetches the global leaderboard.
    globalLeaderboard(): Promise<GlobalScore[]>;
}
