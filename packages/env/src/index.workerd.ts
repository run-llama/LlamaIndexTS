/**
 * This module is under Cloudflare Workers environment.
 *
 * Most of Node.js APIs are not available in Cloudflare Workers environment.
 *
 * @module
 */
import { INTERNAL_ENV } from "./utils.js";

export * from "./polyfill.js";

export function getEnv(name: string): string | undefined {
  return INTERNAL_ENV[name];
}

export { Tokenizers, tokenizers, type Tokenizer } from "./tokenizers/js.js";
