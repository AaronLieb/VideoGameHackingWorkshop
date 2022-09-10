import * as ws from "/public/js/common/wsclient.js";
import * as session from "/public/js/session.js";

let type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) type = "canvas";
PIXI.utils.sayHello(type);

const app = new PIXI.Application({ width: 256, height: 256 });
document.body.appendChild(app.view);

const ses = session.Connect();
