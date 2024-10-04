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
import { createHash } from "node:crypto";
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

export function randomUUIDFromString(input: string) {
  // Create a hash using SHA-1
  const hash = createHash("sha1").update(input).digest("hex");

  // Format the hash to resemble a UUID (version 5 style)
  const uuid = [
    hash.substring(0, 8),
    hash.substring(8, 12),
    "5" + hash.substring(13, 16), // Set the version to 5 (name-based)
    ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16) +
      hash.substring(18, 20), // Set the variant
    hash.substring(20, 32),
  ].join("-");

  return uuid;
}

export {
  AsyncLocalStorage,
  CustomEvent,
  getEnv,
  setEnvs,
} from "./utils/index.js";
