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

interface EventInit {
  bubbles?: boolean;
  cancelable?: boolean;
  composed?: boolean;
}

interface CustomEventInit<T = any> extends EventInit {
  detail?: T;
}

// Async Local Storage is available cross different JS runtimes
export { AsyncLocalStorage } from "node:async_hooks";

// Node.js 18 doesn't have CustomEvent by default
// Refs: https://github.com/nodejs/node/issues/40678
class CustomEvent<T = any> extends Event {
  readonly #detail: T;
  get detail(): T {
    return this.#detail;
  }
  constructor(event: string, options?: CustomEventInit) {
    super(event, options);
    this.#detail = options?.detail;
  }

  /**
   * @deprecated This method is not supported
   */
  initCustomEvent() {
    throw new Error("initCustomEvent is not supported");
  }
}

const defaultCustomEvent: typeof CustomEvent =
  (globalThis as any).CustomEvent || CustomEvent;

export { defaultCustomEvent as CustomEvent };
