import * as session from "/public/js/session.js";

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

let type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) type = "canvas";
PIXI.utils.sayHello(type);

// 640x400 has 400 which is a multiple of 16. We also want the viewport to be
// 16:10.
const app = new PIXI.Application({ width: 640, height: 400 });
document.getElementById("game").appendChild(app.view);
