/**
 * This module is under Cloudflare Workers environment.
 *
 * Most of Node.js APIs are not available in Cloudflare Workers environment.
 *
 * @module
 */
import { INTERNAL_ENV } from "./utils/index.js";

export * from "./node-polyfill.js";

export function getEnv(name: string): string | undefined {
  return INTERNAL_ENV[name];
}

export { consoleLogger, emptyLogger, type Logger } from "./logger/index.js";
export {
  loadTransformers,
  setTransformers,
  type LoadTransformerEvent,
  type OnLoad,
} from "./multi-model/index.non-nodejs.js";
export { Tokenizers, tokenizers, type Tokenizer } from "./tokenizers/js.js";
