import * as ws from "/src/ws.ts";
import * as map from "/src/common/map.ts";
import * as level from "/src/level.ts";
import { Block, Command, Position, Velocity } from "/src/common/types.ts";

export function AllowedMapBlocks(map: map.Map): Block[] {
    const airBlocks: Block[] = [];

    const check = (block: Block) => {
        const attrs = map.metadata.blockMods[block];
        if (attrs && attrs.includes("air")) {
            airBlocks.push(block);
        }
    };

    for (const block in map.metadata.blocks) check(block);
    for (const block in map.metadata.entities) check(block);

    return airBlocks;
}

export type PositionValidatorOpts = {
    maxViolations: number;
    maxPositions: number;
    maxVelocity: Velocity | null;
    maxTimeout: number; // milliseconds
};

export class PositionValidator {
    readonly opts: PositionValidatorOpts;
    readonly level: level.Level;
    readonly allowedBlocks: Set<Block>;

    private violations = 0;
    // TODO: move this out
    private lastPositions: Position[] = [];
    private timeoutHandle: number | null = null;

    constructor(
        lvl: level.Level,
        opts: PositionValidatorOpts = {
            maxViolations: 5,
            maxPositions: 4, // max pos required to get enough data
            maxVelocity: null,
            maxTimeout: 1000, // 1s
        },
    ) {
        this.opts = opts;
        this.level = lvl;
        this.allowedBlocks = new Set<Block>();
        for (const block of AllowedMapBlocks(lvl.map)) {
            this.allowedBlocks.add(block);
        }
    }

    handleCommand(server: ws.Server, cmd: Command) {
        switch (cmd.type) {
            case "_close": {
                this.clearTimer();
                break;
            }
            case "JOIN": {
                this.renewTimer(server);
                break;
            }
            case "MOVE": {
                const pos = cmd.d.position;
                if (
                    pos.x < 0 || pos.x >= this.level.map.width ||
                    pos.y < 0 || pos.y >= this.level.map.height
                ) {
                    this.throwViolation(server, "illegal: invalid position");
                    break;
                }

                const block = this.level.map.at(pos);
                if (!this.allowedBlocks.has(block)) {
                    this.throwViolation(server, "illegal: invalid position");
                    break;
                }

                if (this.lastPositions.length >= this.opts.maxPositions) {
                    // This actually makes a copy on every MOVE. Very expensive
                    // for such a hot event, but it's JavaScript! Who cares!
                    this.lastPositions = this.lastPositions.slice(-this.opts.maxPositions + 1);
                }
                this.lastPositions.push(cmd.d.position);

                if (this.opts.maxVelocity) {
                    const vel = this.velocity();
                    const max = this.opts.maxVelocity;
                    if (vel && (vel.x > max.x || vel.y > max.y)) {
                        this.throwViolation(server, "illegal: invalid velocity");
                        break;
                    }
                }

                this.renewTimer(server);
                break;
            }
        }
    }

    // velocity calculates the user's current velocity. If the client has not
    // sent enough MOVE events, then undefined is returned.
    velocity(): Velocity | undefined {
        if (this.lastPositions.length < 2) {
            return undefined;
        }

        const [last, curr] = this.lastPositions.slice(-2);
        return {
            x: curr.x - last.x,
            y: curr.y - last.y,
        };
    }

    private clearTimer() {
        if (this.timeoutHandle !== null) {
            clearTimeout(this.timeoutHandle);
            this.timeoutHandle = null;
        }
    }

    private renewTimer(server: ws.Server) {
        this.clearTimer();
        this.timeoutHandle = setTimeout(() => this.positionTimeout(server), this.opts.maxTimeout);
    }

    // positionTimeout is called when the user hasn't sent a position event in a
    // while.
    private positionTimeout(server: ws.Server) {
        server.closeWithError("illegal: not enough MOVE commands received");
    }

    private throwViolation(server: ws.Server, reason: string) {
        if (this.lastPositions.length >= 2) {
            this.violations++;
            if (this.violations <= this.opts.maxViolations) {
                server.send({
                    type: "CORRECTION",
                    d: {
                        position: this.lastPositions.at(-1),
                        velocity: this.velocity(),
                    },
                });
                return;
            }
        }

        // Either no previous position/velocity or we've reached the maximum
        // number of violations. Kick the client out.
        throw reason;
    }
}
