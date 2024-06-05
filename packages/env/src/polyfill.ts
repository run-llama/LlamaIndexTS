/**
 * Polyfill implementation for `@llamaindex/env`.
 *
 * The code should be compatible with any JS runtime.
 *
 * Sometimes you should overwrite the polyfill with a native implementation.
 *
 * @module
 */
import { Sha256 } from "@aws-crypto/sha256-js";
import type { LimitFunction } from "p-limit";
import pathe from "pathe";
import { fs } from "./fs/memory.js";

export { fs, pathe as path };

export interface SHA256 {
  update(data: string | Uint8Array): void;
  // to base64
  digest(): string;
}

export const EOL = "\n";

export function ok(value: unknown, message?: string): asserts value {
  if (!value) {
    const error = Error(message);
    error.name = "AssertionError";
    error.message = message ?? "The expression evaluated to a falsy value.";
    throw error;
  }
}

export function createSHA256(): SHA256 {
  const sha256 = new Sha256();
  return {
    update(data: string | Uint8Array): void {
      sha256.update(data);
    },
    digest() {
      return globalThis.btoa(sha256.digestSync().toString());
    },
  };
}

export function randomUUID(): string {
  return crypto.randomUUID();
}

// @ts-expect-error
const ReadableStream = globalThis.ReadableStream;
// @ts-expect-error
const TransformStream = globalThis.TransformStream;
// @ts-expect-error
const WritableStream = globalThis.WritableStream;

// polyfill for p-limit just awaits every call just to make it work
export async function pLimit(numWorkers: number): Promise<LimitFunction> {
  if (numWorkers !== 1) {
    throw new Error(
      "For non-NodeJS environments only numWorkers=1 is supported.",
    );
  }

  const limitFn = async <Arguments extends unknown[], ReturnType>(
    fn: (...args: Arguments) => PromiseLike<ReturnType> | ReturnType,
    ...args: Arguments
  ): Promise<ReturnType> => {
    return await fn(...args);
  };
  limitFn.activeCount = 1;
  limitFn.pendingCount = 1;

  limitFn.clearQueue = () => {};

  return limitFn;
}

export { AsyncLocalStorage, CustomEvent, getEnv, setEnvs } from "./utils.js";
export { ReadableStream, TransformStream, WritableStream };
