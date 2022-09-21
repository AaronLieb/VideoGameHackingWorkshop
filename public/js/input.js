// ActionKeys is used for game interactions. It is translated from the Keyboard
// object using a keymap.
export const ActionKeys = {
    up: false,
    down: false,
    left: false,
    right: false,
    action1: false,
    action2: false,
    // steal is called when an input device sees a new input from the user. This
    // will effectively steal control of ActionKeys back from whatever device is
    // active, allowing that device to work until any other device steals it
    // back.
    steal: () => {},
};

const updateHooks = [];

function runUpdateHooks(e) {
    for (const hook of updateHooks) {
        hook(e);
    }
}

const secrets = {};
const secretBuffer = new Map();

export function registerSecret(secret, callback) {
    secret = secret.toLowerCase();

    let callbackSet = secrets[secret];
    if (!callbackSet) {
        callbackSet = new Set();
        secrets[secret] = callbackSet;
    }

    callbackSet.add(callback);
    secretBuffer.set(secret, 0);
}

export function unregisterSecret(secret, callback) {
    secret = secret.toLowerCase();

    const callbackSet = secrets[secret];
    if (callbackSet) {
        callbackSet.delete(callback);
    }
}

// Check for secrets. We can hijack the updateHooks object and loop over the
// Keyboards object at the cost of potentially trash performance, but who
// cares.
updateHooks.push(function (e) {
    const key = mapKeyName(e);
    if (!Keyboard[key]) {
        return;
    }

    for (let [str, idx] of secretBuffer) {
        if (str[idx] == key) {
            idx++;
            if (idx == str.length) {
                secrets[str].forEach((callback) => callback());
                secretBuffer.set(str, 0);
            } else {
                secretBuffer.set(str, idx);
            }
        } else if (idx != 0) {
            secretBuffer.set(str, 0);
        }
    }
});

registerSecret("FEEDMELOGS", () => console.log("OM NOM NOM"));

// ActionKeyMap is the key/mouse mapping to ActionKeys properties.
export const ActionKeyMap = {
    "w": "up",
    " ": "up",
    "a": "left",
    "s": "down",
    "d": "right",
    "j": "action1",
    "k": "action2",
};

// Keyboard is an object containing all the keys used in the game. Try not to
// use this object for the game; insteaed, use the ActionKeys object. This will
// allow better portability in the future.
export const Keyboard = {
    "a": false,
    "b": false,
    "c": false,
    "d": false,
    "e": false,
    "f": false,
    "g": false,
    "h": false,
    "i": false,
    "j": false,
    "k": false,
    "l": false,
    "m": false,
    "n": false,
    "o": false,
    "p": false,
    "q": false,
    "r": false,
    "s": false,
    "t": false,
    "u": false,
    "v": false,
    "w": false,
    "x": false,
    "y": false,
    "z": false,
    " ": false,
    active: false,
};

function mapKeyName(e) {
    if (!e || !e.key) {
        return "";
    }

    let keyName = e.key.toLowerCase();
    if (e.keyCode === 32) {
        keyName = " ";
    }

    return keyName;
}

function updateKeyboard(keyName) {
    const actionKey = ActionKeyMap[keyName];
    if (actionKey) {
        ActionKeys[actionKey] = Keyboard[keyName];
    }
}

self.addEventListener("keydown", function (e) {
    const keyName = mapKeyName(e);
    Keyboard[keyName] = true;

    if (!Keyboard.active) {
        ActionKeys.steal();
        ActionKeys.steal = () => {
            Keyboard.active = false;
        };

        Keyboard.active = true;
    }

    if (Keyboard.active) {
        updateKeyboard(keyName);
        runUpdateHooks(e);
    }
});

self.addEventListener("keyup", function (e) {
    const keyName = mapKeyName(e);
    Keyboard[keyName] = false;

    if (Keyboard.active) {
        updateKeyboard(keyName);
        runUpdateHooks(e);
    }
});

// Gamepad is translated from the browser's Gamepad API. It combines all
// gamepads into one.
//
// https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
export let Gamepad = {
    axes: [0, 0],
    buttons: [0, 0],
    active: false,
    connected: false, // automatically updated
};

const gamepadDeadZone = 0.5;

// ActionGamepadMap maps the Gamepad object state to the ActionKeys object.
export const ActionGamepadMap = {
    up: (pad) => pad.axes[1] < -gamepadDeadZone,
    down: (pad) => pad.axes[1] > gamepadDeadZone,
    left: (pad) => pad.axes[0] < -gamepadDeadZone,
    right: (pad) => pad.axes[0] > gamepadDeadZone,
    action1: (pad) => pad.buttons[0] == 1,
    action2: (pad) => pad.buttons[1] == 1,
};

let gamepadHandle;

self.addEventListener("gamepadconnected", function (e) {
    Gamepad = e.gamepad;
    Gamepad.active = false;

    console.log("gamepad detected! we gaming");
    gamepadHandle = setInterval(gamepadLoop, 1000 / 30);
});

function gamepadLoop() {
    if (!Gamepad.connected && gamepadHandle) {
        clearInterval(gamepadHandle);
        gamepadHandle = undefined;
        return;
    }

    for (const [actionKey, cond] of Object.entries(ActionGamepadMap)) {
        const active = cond(Gamepad);

        if (!Gamepad.active && active) {
            // The user has interacted with the gamepad. This implies that they
            // are no longer on the keyboard, so we take back control.
            ActionKeys.steal();
            ActionKeys.steal = () => {
                Gamepad.active = false;
            };
            // Reactivate the gamepad.
            Gamepad.active = true;
        }

        if (Gamepad.active) {
            ActionKeys[actionKey] = active;
        }
    }

    if (Gamepad.active) {
        runUpdateHooks();
    }
}
