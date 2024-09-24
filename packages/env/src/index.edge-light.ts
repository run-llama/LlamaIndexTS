/**
 * Edge light environment polyfill.
 *
 * @module
 */
import "./global-check.js";
export * from "./node-polyfill.js";

export { consoleLogger, emptyLogger, type Logger } from "./logger/index.js";
export {
  loadTransformers,
  setTransformers,
  type LoadTransformerEvent,
  type OnLoad,
} from "./multi-model/index.non-nodejs.js";
export { Tokenizers, tokenizers, type Tokenizer } from "./tokenizers/js.js";
