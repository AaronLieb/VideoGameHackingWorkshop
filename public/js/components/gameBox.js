import { html, preact } from "/public/js/deps.js";
import * as timefmt from "/public/js/internal/timefmt.js";

export class Component {
    element;
    game;
    levelNum;
    controls;

    canvasDivElement;
    controlsDivElement;

    constructor(element, game, levelInfo, handlers) {
        this.element = element;
        this.element.innerHTML = `
			<h2>Level ${levelInfo.number}</h2>
			<div class="game-canvas"></div>
			<div class="game-controls"></div>
		`;

        // Pull out the elements that Preact made. There's probably a better
        // way, but I don't care.
        this.canvasDivElement = this.element.querySelector(".game-canvas");
        this.controlsDivElement = this.element.querySelector(".game-controls");

        this.game = game;
        this.game.resizeTo = this.canvasDivElement;
        this.game.resizeToElem();

        // Insert the game canvas. Preact does not like having a real DOM
        // element in its VDOM.
        this.canvasDivElement.appendChild(this.game.view);

        // Initialize the component with the div that we just made. The
        // component will update itself in the background.
        this.controls = new controlsComponent(this.controlsDivElement, handlers);
    }

    destroy() {
        this.controls.destroy();
        // Wipe all DOM elements that we made.
        this.element.textContent = "";
    }
}

export class controlsComponent {
    element;
    handlers;
    startTime;
    currentTime;
    timerHandle;

    constructor(element, handlers) {
        this.element = element;
        this.handlers = handlers;

        this.startTime = Date.now();
        this.currentTime = this.startTime;

        this.timerHandle = setInterval(() => {
            this.currentTime = Date.now();
            this.update();
        }, 1000);

        this.update();
    }

    destroy() {
        if (this.timerHandle) {
            clearInterval(this.timerHandle);
            this.timerHandle = null;
        }
    }

    update() {
        preact.render(this.render(), this.element);
    }

    render() {
        return html`
			<div class="game-timer">
				<h4>Time Elapsed</h4>
				<p>${timefmt.duration(this.currentTime - this.startTime, false)}</p>
			</div>
			<div class="game-buttons">
				<button class="game-quit outline" onclick=${() => this.handlers.quit()}>
					Quit
				</button>
				<button class="game-restart outline" onclick=${() => this.handlers.restart()}>
					Restart
				</button>
			</div>
		`;
    }
}
