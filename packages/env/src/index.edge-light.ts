/**
 * Edge light environment polyfill.
 *
 * @module
 */
export * from "./als/index.non-node.js";
export { consoleLogger, emptyLogger, type Logger } from "./logger/index.js";
export * from "./node-polyfill.js";
export * from "./stream/index.js";
export { Tokenizers, tokenizers, type Tokenizer } from "./tokenizers/js.js";
export { NotSupportCurrentRuntimeClass } from "./utils/shared.js";
import "./global-check.js";
