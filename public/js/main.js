import * as ws from "/public/js/common/wsclient.js";
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

document.body.appendChild(app.view);

const socket = new WebSocket("ws:///api/ws");
const ses = new session.Session();
new ws.Client(socket, ses);
