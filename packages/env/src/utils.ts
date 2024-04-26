// DO NOT EXPOSE THIS VARIABLE TO PUBLIC, IT IS USED INTERNALLY FOR CLOUDFLARE WORKER
export const INTERNAL_ENV: Record<string, string> = {};

export function setEnvs(envs: object): void {
  Object.assign(INTERNAL_ENV, envs);
}

export function getEnv(name: string): string | undefined {
  if (INTERNAL_ENV[name]) {
    return INTERNAL_ENV[name];
  }
  if (typeof process === "undefined" || typeof process.env === "undefined") {
    // @ts-expect-error
    if (typeof Deno === "undefined") {
      throw new Error("Current environment is not supported");
    } else {
      // @ts-expect-error
      return Deno.env.get(name);
    }
  }
  return process.env[name];
}

// Browser doesn't support AsyncLocalStorage
export { AsyncLocalStorage } from "node:async_hooks";

class CustomEvent<T = any> extends Event {
  readonly #detail: T;
  get detail(): T {
    return this.#detail;
  }
  constructor(event: string, options?: CustomEventInit) {
    super(event, options);
    this.#detail = options?.detail;
  }
}

// Node.js doesn't have CustomEvent by default
// Refs: https://github.com/nodejs/node/issues/40678
const defaultCustomEvent = globalThis.CustomEvent || CustomEvent;

export { defaultCustomEvent as CustomEvent };
