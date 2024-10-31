import { glo } from "./shared.js";

// DO NOT EXPOSE THIS VARIABLE TO PUBLIC, IT IS USED INTERNALLY FOR BROWSER ENVIRONMENT
export const INTERNAL_ENV: Record<string, string> = {};

export function setEnvs(envs: object): void {
  Object.assign(INTERNAL_ENV, envs);
}

export function getEnv(name: string): string | undefined {
  if (INTERNAL_ENV[name]) {
    return INTERNAL_ENV[name];
  }
}

// Web doesn't have AsyncLocalStorage and there's no alternative way to implement it
// Wait for https://github.com/tc39/proposal-async-context
export class AsyncLocalStorage<T> {
  #store: T = null!;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static bind<Func extends (...args: any[]) => any>(fn: Func): Func {
    return fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static snapshot(): <R, TArgs extends any[]>(
    fn: (...args: TArgs) => R,
    ...args: TArgs
  ) => R {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (cb: any, ...args: any[]) => cb(...args);
  }

  getStore() {
    return this.#store;
  }

  run<R>(store: T, cb: () => R): R {
    this.#store = store;
    if (cb.constructor.name === "AsyncFunction") {
      console.warn("AsyncLocalStorage is not supported in the web environment");
      console.warn("Please note that some features may not work as expected");
    }
    return cb();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultCustomEvent = (globalThis as any).CustomEvent;

export { defaultCustomEvent as CustomEvent };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultProcess: NodeJS.Process = (globalThis as any).process || {};
const processProxy = new Proxy(defaultProcess, {
  get(_target, prop) {
    switch (prop) {
      case "version":
        return glo.navigator.version; // Return empty string for version
      case "platform":
        return "browser"; // Return browser platform
      case "arch":
        return "javascript"; // Return javascript arch
      default:
        break;
    }
    return ""; // Return empty string for all other properties
  },
});
export { processProxy as process };
