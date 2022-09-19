import { html, preact } from "/public/js/deps.js";
import { escapeHTML } from "/public/js/html/escape.js";
import * as timefmt from "/public/js/internal/timefmt.js";

export class Component {
    element;
    // .onSelectLevel: (level: number) => void;
    handlers;

    constructor(element, handlers) {
        this.levelInfo = [/* LevelInfo */];
        this.leaderboards = new Map(); // Map<number LevelScore[]>
        this.personalScores = new Map(); // Map<number PersonalScore>

        this.element = element;
        this.handlers = handlers;
    }

    set(state) {
        Object.assign(this, state);
        this.update();
    }

    update() {
        preact.render(this.render(), this.element);
    }

    render() {
        if (!this.levelInfo) {
            return "";
        }

        const infos = this.levelInfo.map((level) => {
            const info = {
                number: level.number,
                name: level.name,
                desc: level.desc,
            };

            const leaderboard = this.leaderboards.get(level.number);
            if (leaderboard && leaderboard.length != 0) {
                info.leaderboard = leaderboard;
                info.globalBest = {
                    username: leaderboard[0].username,
                    bestTime: leaderboard[0].bestTime,
                };
            }

            const personalScore = this.personalScores.get(level.number);
            if (personalScore) {
                info.personalScore = personalScore;
            }

            return info;
        });

        // deno-fmt-ignore
        return html`
			<h2>Choose a Level</h2>
			${infos.map((info) => html`
				<details class="level-item" id="level-${info.number}">
					<summary class="level-info">
						${renderSummary(info)}
					</summary>
					<div class="level-extras">
						<button class="level-enter" onclick=${() => this.handlers.onSelectLevel(info.number)}>
							Enter
						</button>
						<p class="level-description">
							${info.desc && escapeHTML(info.desc)}
						</p>
						${renderLeaderboard(info.leaderboard)}
					</div>
				</details>
			`)}
		`;
    }
}

function renderSummary(info) {
    // deno-fmt-ignore
    return html`
		<h3>
			Level ${info.number}
			${info.name && html`<small>(${escapeHTML(info.name)})</small>`}
		</h3>
		<p class="level-scores">
			${info.globalBest && html`
				<span class="score-k">Global Best:</span>
				<span class="score-v">
					<time datetime="${timefmt.duration(info.globalBest.bestTime)}">
						${timefmt.duration(info.globalBest.bestTime)}
					</time>
				</span>
			`}
			${info.personalScore && html`
				<span class="score-k">Personal Best:</span>
				<span class="score-v">
					<time datetime="${timefmt.duration(info.personalScore.bestTime)}">
						${timefmt.duration(info.personalScore.bestTime)}
					</time>
					(#${info.personalScore.rank})
				</span>
			`}
		</p>
	`
}

function renderLeaderboard(leaderboard) {
    // deno-fmt-ignore
    return html`
		<div class="level-leaderboard">
			<h4>Leaderboard</h4>
			<table>
				<thead>
					<tr>
						<th class="rank">Rank</th>
						<th class="user">Username</th>
						<th class="time">Best Time</th>
					</tr>
				</thead>
				<tbody>
					${leaderboard ? leaderboard.map((score) => html`
						<tr>
							<td class="rank">${score.rank}</td>
							<td class="user">${escapeHTML(score.username)}</td>
							<td class="time">${timefmt.duration(score.bestTime)}</td>
						</tr>
					`) : html`
						<tr class="leaderboard-placeholder">
							<td colspan="3">Nobody here but us chickens!</td>
						</tr>
					`}
				</tbody>
			</table>
		</div>
	`
}
