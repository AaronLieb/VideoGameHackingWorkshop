import * as pixi from "https://cdn.jsdelivr.net/npm/pixi.js@6.5.3/dist/browser/pixi.mjs";
import * as pixi_legacy from "https://cdn.jsdelivr.net/npm/pixi.js-legacy@6.5.3/dist/browser/pixi-legacy.mjs";

export const PIXI = pixi.utils.isWebGLSupported() ? pixi : pixi_legacy;
