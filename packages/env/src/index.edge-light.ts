/**
 * Edge light environment polyfill.
 *
 * @module
 */
import "./global-check.js";
export { consoleLogger, emptyLogger, type Logger } from "./logger/index.js";
export * from "./node-polyfill.js";
export { Tokenizers, tokenizers, type Tokenizer } from "./tokenizers/js.js";
export { NotSupportCurrentRuntimeClass } from "./utils/shared.js";
