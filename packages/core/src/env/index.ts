import { ok } from "node:assert";
import { createHash, randomUUID } from "node:crypto";
import { EOL } from "node:os";
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

export { EOL, ok, randomUUID };
