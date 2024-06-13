/**
 * This module is under Node.js environment.
 * It provides a set of APIs to interact with the file system, streams, and other Node.js built-in modules.
 *
 * Use this under "node" condition,
 *
 * For example:
 * ```shell
 * node -e "const env = require('@llamaindex/env');"
 * ```
 *
 * @module
 */
import { ok } from "node:assert";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import {
  ReadableStream,
  TransformStream,
  WritableStream,
} from "node:stream/web";
import { fs } from "./fs/node.js";
import type { SHA256 } from "./polyfill.js";

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

export { AsyncLocalStorage, CustomEvent, getEnv, setEnvs } from "./utils.js";
export {
  ReadableStream,
  TransformStream,
  WritableStream,
  fs,
  ok,
  path,
  randomUUID,
};
