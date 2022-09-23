// Credits to @JustinStitt for the camera lerp code.

export class Camera {
    // focusBounds? are the percentage that determines how big the focus box is
    // relative to the screen box.
    focusBoundsW = 0.70;
    focusBoundsH = 0.80;
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
        return this.gameX(this.stage.x);
    }

    set x(x) {
        this.stage.x = this.pixiX(x);
    }

    get y() {
        return this.gameY(this.stage.y);
    }

    set y(y) {
        this.stage.y = this.pixiY(y);
    }

    get width() {
        return this.gameX(this.screen.width);
    }

    get height() {
        return this.gameY(this.screen.height);
    }

    // focus moves the camera so that position is visible on stage. Note that
    // the camera is not guaranteed to be instantly updated. Never assume that x
    // or y will return the focused position immediately.
    focus(pt) {
        this.#focusTo = pt;
    }

    #update() {
        const pt = this.#focusTo;
        if (!pt) {
            return;
        }

        const focusW = this.focusBoundsW * this.width;
        const focusH = this.focusBoundsH * this.height;

        // NOTE that we're shifting the whole stage to control the camera. WE
        // ARE NOT MOVING THE SCREEN!
        const f = {
            p1: {
                x: -this.x + (this.width / 2) - (focusW / 2),
                y: -this.y + (this.height / 2) - (focusH / 2),
            },
            p2: {
                // x: Math.min(-this.x + (this.game.width / 2) + (focusW / 2), -this.game.width),
                // y: Math.max(-this.y + (this.game.height / 2) + (focusH / 2), -this.game.height),
                x: -this.x + (this.width / 2) + (focusW / 2),
                y: -this.y + (this.height / 2) + (focusH / 2),
            },
        };

        const xdiff = f.p1.x > pt.x || pt.x > f.p2.x;
        const ydiff = f.p1.y > pt.y || pt.y > f.p2.y;

        if (xdiff) {
            // Point is out of bounds on the X-axis. Lerp it to the nearest
            // edge.
            if (f.p1.x > pt.x) {
                this.x -= (pt.x - f.p1.x) * this.lerp;
            }
            if (pt.x > f.p2.x) {
                this.x -= (pt.x - f.p2.x) * this.lerp;
            }
            this.x = Math.min(this.x, 0);
            this.x = Math.max(this.x, -this.game.width);
        }

        if (ydiff) {
            // Point is out of bounds on the Y-axis. Lerp it to the nearest
            // edge.
            if (f.p1.y > pt.y) {
                this.y -= (pt.y - f.p1.y) * this.lerp;
            }
            if (pt.y > f.p2.y) {
                this.y -= (pt.y - f.p2.y) * this.lerp;
            }
            this.y = Math.min(this.y, 0);
            this.y = Math.max(this.y, -this.game.height);
        }

        if (!xdiff && !ydiff) {
            // Invalidate focusTo to free up some CPU cycles on each frame.
            this.#focusTo = undefined;
        }
    }
}
