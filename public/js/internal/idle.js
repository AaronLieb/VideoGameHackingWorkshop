const hooks = new Set();

// Idle is true if we're currently idling for some reason, usually because the
// tab is not focused.
export let Idle = false;

// onIdle is called to add a hook that is invoked when the idle state changes.
export function onIdle(callback) {
    hooks.add(callback);
    callback();
}

// removeOnIdle removes the callback added previously with onIdle.
export function removeOnIdle(callback) {
    hooks.delete(callback);
}

window.onfocus = function () {
    Idle = false;
    for (const callback of hooks) callback(Idle);
};

window.onblur = function () {
    Idle = true;
    for (const callback of hooks) callback(Idle);
};
