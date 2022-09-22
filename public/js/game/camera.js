export class Camera {
    // focusBounds? are the percentage that determines how big the focus box is
    // relative to the screen box.
    focusBoundsW = 0.70;
    focusBoundsH = 0.90;
    lerp = 0.45;

    #focusTo;
    #focusCallback;

    constructor(game) {
        this.game = game;
        this.stage = game.stage;
        this.screen = game.screen;
        this.gameX = game.gameX;
        this.gameY = game.gameY;
        this.pixiX = game.pixiX;
        this.pixiY = game.pixiY;

        this.#focusCallback = () => this.#update();
        this.game.frameTicker.add(this.#focusCallback);
    }

    destroy() {
        this.game.frameTicker.remove(this.#focusCallback);
    }

    get x() {
        return this.game.gameX(this.stage.x);
    }

    set x(x) {
        this.stage.x = this.game.pixiX(x);
    }

    get y() {
        return this.game.gameY(this.stage.y);
    }

    set y(y) {
        this.stage.y = this.game.pixiY(y);
    }

    // focus moves the camera so that position is visible on stage. Note that
    // the camera is not guaranteed to be instantly updated. Never assume that x
    // or y will return the focused position immediately.
    focus(pt) {
        this.#focusTo = pt;
    }

    #update() {
        if (!this.#focusTo) {
            return;
        }

        const focusW = this.focusBoundsW * this.game.width;
        const focusH = this.focusBoundsH * this.game.height;

        const pt = this.#focusTo;
        const f = {
            p1: {
                x: -this.x + (this.game.width / 2) - (focusW / 2),
                y: -this.y + (this.game.height / 2) - (focusH / 2),
            },
            p2: {
                x: -this.x + (this.game.width / 2) + (focusW / 2),
                y: -this.y + (this.game.height / 2) + (focusH / 2),
            },
        };

        if (f.p1.x > pt.x || pt.x > f.p2.x) {
            // Point is out of bounds on the X-axis. Lerp it to the nearest
            // edge.
            if (f.p1.x > pt.x) {
                this.x -= (pt.x - f.p1.x) * this.lerp;
            }
            if (pt.x > f.p2.x) {
                this.x -= (pt.x - f.p2.x) * this.lerp;
            }
        }

        if (f.p1.y > pt.y || pt.y > f.p2.y) {
            // Point is out of bounds on the Y-axis. Lerp it to the nearest
            // edge.
            if (f.p1.y > pt.y) {
                this.y -= (pt.y - f.p1.y) * this.lerp;
            }
            if (pt.y > f.p2.y) {
                this.y -= (pt.y - f.p2.y) * this.lerp;
            }
        }
    }
}
