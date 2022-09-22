import * as html from "/public/js/html/html.js";

export class Counter {
    static movingAvg = 15;

    element;

    #fpsCallback;
    #fpsAvg = [];
    #tpsAvg = [];

    constructor(game) {
        this.element = html.ToElement(`<p class="game-fps-counter"></p>`);

        this.#fpsCallback = () => {
            shiftAppend(this.#fpsAvg, Counter.movingAvg, game.frameTicker.FPS);
            shiftAppend(this.#tpsAvg, Counter.movingAvg, game.engineTicker.FPS);
            this.#update();
        };

        // Use the Application ticker so our FPS number is updated on every
        // frame instead of on every enigne tick.
        this.game = game;
        this.game.frameTicker.add(this.#fpsCallback);
    }

    destroy() {
        this.game.frameTicker.remove(this.#fpsCallback);
    }

    #update() {
        const fps = Math.floor(avg(this.#fpsAvg));
        const tps = Math.floor(avg(this.#tpsAvg));
        this.element.textContent = `${fps} FPS\n${tps} TPS`;
    }
}

function avg(array) {
    let sum = 0;
    for (const v of array) sum += v;
    return sum / array.length;
}

function shiftAppend(array, max, item) {
    while (array.length >= max) {
        array.shift();
    }
    array.push(item);
}
