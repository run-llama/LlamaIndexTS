import { INTERNAL_ENV } from "./utils.js";

export * from "./index.polyfill.js";

export function getEnv(name: string): string | undefined {
  return INTERNAL_ENV[name];
}
