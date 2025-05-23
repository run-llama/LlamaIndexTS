/**
 * This module is under Cloudflare Workers environment.
 *
 * Most of Node.js APIs are not available in Cloudflare Workers environment.
 *
 * @module
 */
import { INTERNAL_ENV } from "./utils/index.js";

export * from "./als/index.workerd.js";
export { NotSupportCurrentRuntimeClass } from "./utils/shared.js";

export * from "./node-polyfill.js";
export * from "./utils/base64.js";

export function getEnv(name: string): string | undefined {
  return INTERNAL_ENV[name];
}

export * from "./logger/index.js";
