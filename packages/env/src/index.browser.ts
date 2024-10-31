/**
 * Web environment polyfill.
 *
 * @module
 */
import "./global-check.js";

export { consoleLogger, emptyLogger, type Logger } from "./logger/index.js";
export {
  loadTransformers,
  setTransformers,
  type LoadTransformerEvent,
  type OnLoad,
} from "./multi-model/index.browser.js";
export { Tokenizers, tokenizers, type Tokenizer } from "./tokenizers/js.js";
export { NotSupportCurrentRuntimeClass } from "./utils/shared.js";
export * from "./web-polyfill.js";
// @ts-expect-error no type
if (typeof window === "undefined") {
  console.warn(
    "You are not in a browser environment. This module is not supposed to be used in a non-browser environment.",
  );
}
