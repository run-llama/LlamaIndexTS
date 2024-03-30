export function getEnv(name: string): string | undefined {
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
