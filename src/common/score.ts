// DO NOT MODIFY THIS FILE without consulting the below Desmos link:
// https://www.desmos.com/calculator/ie6lnuyhlg.
//
// YOU HAVE BEEN WARNED! Read the Desmos link first!!!
//
// A few notes about this file:
//
//    - KEEP EVERYTHING SNAKE_CASED except for the exported functions. This is
//      to keep it equal to the Desmos file to avoid confusion.
//    - When you change the code, ALSO UPDATE THE DESMOS FILE.
//    - Avoid exposing too much of this file. Ideally, all the maths should only
//      be exposed as a single function. Helper functions are permitted but
//      should only use the single calculator function.

import { LevelInfo, PersonalScore } from "/src/common/types.ts";

// base is the base score multiplier.
const base = 100;

// c is the function constant for the primitive curve function. It is important
// to make p(x) more extreme as the level gets easier, so we can reward people
// who took a long time on an easy level less.
//
// Note that the ultimate multiplier is still the level multiplier. As you will
// see above, when modifying the variable `t`, the final score does not change
// much compared to variable `l`.
const c = 0.15;

// level_min is the lowest level number that matters for the primitive curve
// function.
const level_min = 1;

// level_max is the highest level number that matters for the primitive curve
// function.
const level_max = 20;

// level_scale calculated the scaled level factor. We scale the level according
// to the minimum maximum level at which we decide that there's no point in
// making the curve any more or less extreme.
function level_scale(level: number, level_weight: number): number {
    return (2 * ((level - level_min) / (level_max - level_min)) + 1) * level_weight;
}

// time_max is the slowest duration that determines when it doesn't matter
// anymore if the player finishes slower than this.
const time_max = 10 * 60; // 10 minutes

// time_scale scales the time according to the minimum and maximum value, which
// is from 1 seconds to 10 minutes.
function time_scale(time: number): number {
    return time / time_max;
}

// p is the unscaled function for Calculate.
function p(time_s: number) {
    return c / Math.sqrt(c + time_s);
}

// f is the function for the total points.
function f(time: number, level: number, level_weight: number): number {
    const time_s = time_scale(time);
    const level_s = level_scale(level, level_weight);
    return (p(time_s) / p(0)) * base * level_s;
}

// Calculate calculates the score based on the time and the level.
export function Calculate(time: number, level: number, levelWeight = 1.0): number {
    return f(time, level, levelWeight);
}

// CalculateScores calculates all the personal scores into a total cumulative
// score.
export function CalculateScores(scores: Map<number, number>, levels: Map<number, LevelInfo>): number {
    let total = 0;

    for (const [levelN, bestTime] of scores) {
        let weight;

        const level = levels.get(levelN);
        if (level && level.weight) {
            weight = level.weight;
        }

        total += Calculate(bestTime, levelN, weight);
    }

    return total;
}