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
