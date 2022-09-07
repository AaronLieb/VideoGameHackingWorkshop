import * as session from "/public/js/session.js";
import { Keyboard } from "/public/js/keyboard.js";
import { Player } from "/public/js/player.js";
import { physicsLoop } from "/public/js/physics.js";
import { app, initializeApp } from "/public/js/render.js";

initializeApp();
Keyboard.initializeListeners();

// game loop
app.ticker.add((delta) => {
    physicsLoop(delta);
});

const player = new Player();

const ses = await session.Connect()
    .catch((err) => {
        if (err instanceof session.NotLoggedInError) {
            window.location.replace("/login/");
        } else {
            alert(`cannot connect to WS: ${err}`);
        }
        throw err;
    });

console.log(`logged in as ${ses.username}`);
