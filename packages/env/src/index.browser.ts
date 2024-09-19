/**
 * Web environment polyfill.
 *
 * @module
 */
import "./global-check.js";
export * from "./web-polyfill.js";

export {
  loadTransformers,
  setTransformers,
  type LoadTransformerEvent,
  type OnLoad,
} from "./multi-model/index.browser.js";
export { Tokenizers, tokenizers, type Tokenizer } from "./tokenizers/js.js";

// @ts-expect-error
if (typeof window === "undefined") {
  console.warn(
    "You are not in a browser environment. This module is not supposed to be used in a non-browser environment.",
  );
}
