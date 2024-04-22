import { ok } from "node:assert";
import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import { EOL } from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import type { SHA256 } from "./index.polyfill.js";
import type { CompleteFileSystem } from "./type.js";

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

export const defaultFS: CompleteFileSystem = {
  writeFile: async function (path: string | URL, content: string) {
    return fs.writeFile(path, content, "utf-8");
  },
  readRawFile: async function (path: string | URL): Promise<Buffer> {
    if (path instanceof URL) {
      if (path.protocol === "http:" || path.protocol === "https:") {
        const response = await fetch(path);
        return Buffer.from(await response.arrayBuffer());
      }
    }
    return fs.readFile(path);
  },
  readFile: async function (path: string | URL): Promise<string> {
    if (path instanceof URL) {
      if (path.protocol === "http:" || path.protocol === "https:") {
        const response = await fetch(path);
        return response.text();
      }
    }
    return fs.readFile(path, "utf-8");
  },
  access: fs.access,
  mkdir: fs.mkdir,
  readdir: fs.readdir,
  stat: fs.stat,
};

export type * from "./type.js";
export { AsyncLocalStorage, CustomEvent, getEnv } from "./utils.js";
export { EOL, ok, path, pipeline, randomUUID };
