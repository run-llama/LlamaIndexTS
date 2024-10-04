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
import { EOL } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { createWriteStream, fs } from "./fs/node.js";
import "./global-check.js";
import type { SHA256 } from "./node-polyfill.js";

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

export { consoleLogger, emptyLogger, type Logger } from "./logger/index.js";
export {
  loadTransformers,
  setTransformers,
  type LoadTransformerEvent,
  type OnLoad,
} from "./multi-model/index.js";
export { Tokenizers, tokenizers, type Tokenizer } from "./tokenizers/node.js";
export {
  AsyncLocalStorage,
  CustomEvent,
  getEnv,
  setEnvs,
} from "./utils/index.js";
export {
  createWriteStream,
  EOL,
  fileURLToPath,
  fs,
  ok,
  path,
  randomUUID,
  Readable,
};
