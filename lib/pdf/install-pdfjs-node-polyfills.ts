/**
 * pdfjs-dist bundles `canvas.js` with a top-level `new DOMMatrix()` before its own
 * node_utils polyfill runs. In Node, DOMMatrix must exist before that module evaluates.
 * Load @napi-rs/canvas first and mirror its geometry types onto globalThis.
 */
import * as napiCanvas from "@napi-rs/canvas";

const { DOMMatrix, ImageData, Path2D } = napiCanvas;

if (typeof globalThis.DOMMatrix === "undefined") {
  globalThis.DOMMatrix = DOMMatrix as unknown as typeof globalThis.DOMMatrix;
}
if (typeof globalThis.ImageData === "undefined") {
  globalThis.ImageData = ImageData as unknown as typeof globalThis.ImageData;
}
if (typeof globalThis.Path2D === "undefined") {
  globalThis.Path2D = Path2D as unknown as typeof globalThis.Path2D;
}
if (!globalThis.navigator?.language) {
  globalThis.navigator = {
    language: "en-US",
    platform: "",
    userAgent: "",
  } as unknown as Navigator;
}
