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
/** rollup-private-do-not-use-esm-shim-polyfill */
import { ok } from "node:assert";
import { createHash, randomUUID } from "node:crypto";
import { EOL } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { createWriteStream, fs } from "./fs/node.js";
import "./global-check.js";
import { type SHA256 } from "./node-polyfill.js";

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

export const process = globalThis.process;

export * from "./als/index.node.js";
export { consoleLogger, emptyLogger, type Logger } from "./logger/index.js";
export { CustomEvent, getEnv, setEnvs } from "./utils/index.js";
export { NotSupportCurrentRuntimeClass } from "./utils/shared.js";
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
