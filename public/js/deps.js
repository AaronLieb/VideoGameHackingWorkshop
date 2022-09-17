import * as pixi from "https://cdn.jsdelivr.net/npm/pixi.js@6.5.3/dist/browser/pixi.mjs";
import * as pixi_legacy from "https://cdn.jsdelivr.net/npm/pixi.js-legacy@6.5.3/dist/browser/pixi-legacy.mjs";

export const PIXI = pixi.utils.isWebGLSupported() ? pixi : pixi_legacy;
export * as reef from "https://cdn.jsdelivr.net/npm/reefjs@12.1.0/dist/reef.es.min.js";
export * as preact from "https://cdn.jsdelivr.net/npm/htm@3.1.1/preact/standalone.mjs";
export { html } from "https://cdn.jsdelivr.net/npm/htm@3.1.1/preact/standalone.mjs";
export * as o from "https://cdn.jsdelivr.net/gh/zserge/o@0.0.6/o.mjs";
