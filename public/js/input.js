// ActionKeys is used for game interactions. It is translated from the Keyboard
// object using a keymap.
export const ActionKeys = {
    up: false,
    down: false,
    left: false,
    right: false,
    jump: false,
    action1: false,
    action2: false,
};

// ActionKeyMap is the key/mouse mapping to ActionKeys properties.
export const ActionKeyMap = {
    up: "w",
    left: "a",
    down: "s",
    right: "d",
    jump: " ",
    action1: "j",
    action2: "k",
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
};

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

registerSecret("FEEDMELOGS", () => console.log("OM NOM NOM"));

const updateHooks = [
    // Update ActionKeys.
    function () {
        for (const [actionKey, key] of Object.entries(ActionKeyMap)) {
            ActionKeys[actionKey] = Keyboard[key];
        }
    },
    // Check for secrets. We can hijack the updateHooks object and loop over the
    // Keyboards object at the cost of potentially trash performance, but who
    // cares.
    function (e) {
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
    },
];

function runUpdateHooks(e) {
    for (const hook of updateHooks) {
        hook(e);
    }
}

function mapKeyName(e) {
    let keyName = e.key.toLowerCase();
    if (e.keyCode === 32) {
        keyName = " ";
    }
    return keyName;
}

function onKeyDown(e) {
    const key = mapKeyName(e);
    Keyboard[key] = true;

    runUpdateHooks(e);
}

function onKeyUp(e) {
    const key = mapKeyName(e);
    Keyboard[key] = false;

    runUpdateHooks(e);
}

self.addEventListener("keydown", onKeyDown);
self.addEventListener("keyup", onKeyUp);
