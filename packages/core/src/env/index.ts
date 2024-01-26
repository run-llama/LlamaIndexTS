import { ok } from "node:assert";
import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import { EOL } from "node:os";
import path from "node:path";
import type { CompleteFileSystem } from "../storage";
import type { SHA256 } from "./index.edge-light";

export function createSHA256(): SHA256 {
  const hash = createHash("sha256");
  return {
    update(data: string | Uint8Array): void {
      hash.update(data);
    },
    digest() {
      return hash.digest("base64");
    },
  };
}

export const defaultFS: CompleteFileSystem = fs;

export { EOL, ok, path, randomUUID };
