import { Leaderboards, LevelLeaderboard, Millisecond, PersonalScore } from "/src/common/types.ts";

// Storer describes a store for all of the game data.
export interface Storer {
    close(): Promise<void>;
    // setScore returns the new PersonalScore if the given score is a new high
    // score of the given user.
    setScore(level: number, username: string, bestTime: Millisecond): Promise<PersonalScore | undefined>;
    // userScore gets the score of the given user and level.
    userScore(level: number, username: string): Promise<PersonalScore | undefined>;
    // leaderboard returns the given level's leaderboard.
    leaderboard(level: number): Promise<LevelLeaderboard>;
    // leaderboards returns all leaderboards. Probably don't use this.
    leaderboards(): Promise<Leaderboards>;
}
