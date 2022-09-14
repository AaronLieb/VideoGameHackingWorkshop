import * as session from "/public/js/session.js";
import { Level } from "/public/js/level.js";
import { Engine } from "/public/js/common/physics.js";
import { Keyboard } from "/public/js/keyboard.js";
import { Player } from "/public/js/player.js";
import { app, initializeApp } from "/public/js/render.js";

initializeApp();
Keyboard.initializeListeners();

const ses = await session.Connect()
    .catch((err) => {
        if (err instanceof session.NotLoggedInError) {
            window.location.replace("/login/");
        } else {
            alert(`cannot connect to WS: ${err}`);
        }
        throw err;
    });

window.session = ses;

console.log(`logged in as ${ses.username}`);
