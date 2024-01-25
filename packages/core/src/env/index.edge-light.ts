import { Sha256 } from "@aws-crypto/sha256-js";
import pathe from "pathe";
import { CompleteFileSystem, InMemoryFileSystem } from "../storage";

export { pathe as path };

export interface SHA256 {
  update(data: string | Uint8Array): void;
  // to base64
  digest(): string;
}

export const EOL = "\n";

export const defaultFS: CompleteFileSystem = new InMemoryFileSystem();

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
