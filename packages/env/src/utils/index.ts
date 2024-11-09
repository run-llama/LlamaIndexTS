// DO NOT EXPOSE THIS VARIABLE TO PUBLIC, IT IS USED INTERNALLY FOR CLOUDFLARE WORKER
export const INTERNAL_ENV: Record<string, string> = {};

/**
 * Set environment variables before using llamaindex, because some LLM need to access API key before running.
 *
 * You have to set the environment variables in Cloudflare Worker environment,
 * because it doesn't have any global environment variables.
 *
 * @example
 * ```ts
 * export default {
 *   async fetch(
 *     request: Request,
 *     env: Env,
 *     ctx: ExecutionContext,
 *   ): Promise<Response> {
 *     const { setEnvs } = await import("@llamaindex/env");
 *     setEnvs(env);
 *     // ...
 *     return new Response("Hello, World!");
 *   },
 * };
 * ```
 *
 * @param envs Environment variables
 */
export function setEnvs(envs: object): void {
  Object.assign(INTERNAL_ENV, envs);
}

export function getEnv(name: string): string | undefined {
  if (INTERNAL_ENV[name]) {
    return INTERNAL_ENV[name];
  }
  if (typeof process === "undefined" || typeof process.env === "undefined") {
    // @ts-expect-error Deno is not defined
    if (typeof Deno === "undefined") {
      throw new Error("Current environment is not supported");
    } else {
      // @ts-expect-error Deno is not defined
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CustomEventInit<T = any> extends EventInit {
  detail?: T;
}

// Node.js 18 doesn't have CustomEvent by default
// Refs: https://github.com/nodejs/node/issues/40678
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).CustomEvent || CustomEvent;

export { defaultCustomEvent as CustomEvent };
