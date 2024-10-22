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
import pathe from "pathe";
import { NotSupportCurrentRuntimeClass } from "./utils/shared.js";

export { createWriteStream, fs } from "./fs/memory.js";
export { fileURLToPath } from "./url/index.js";
export { pathe as path };
export const Readable = NotSupportCurrentRuntimeClass.bind("non-Node.js");

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

export const process: NodeJS.Process = globalThis.process;

export {
  AsyncLocalStorage,
  CustomEvent,
  getEnv,
  setEnvs,
} from "./utils/index.js";
