const validKeyCodes = [87, 65, 83, 68, 32]; // wasd, space

const keyDownHandler = (e) => {
    if (!validKeyCodes.includes(e.keyCode)) return;
    if (e.keyCode === 32) e.key = "space";
    Keyboard[e.key] = true;
    event.preventDefault();
};

const keyUpHandler = (e) => {
    if (!validKeyCodes.includes(e.keyCode)) return;
    if (e.keyCode === 32) e.key = "space";
    Keyboard[e.key] = false;
    event.preventDefault();
};

export let Keyboard = {
    initializeListeners: () => {
        window.addEventListener("keydown", keyDownHandler.bind(this), false);
        window.addEventListener("keyup", keyUpHandler.bind(this), false);
    },
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
};
