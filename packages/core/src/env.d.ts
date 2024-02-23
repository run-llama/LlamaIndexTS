declare module "#llamaindex/env" {
  import { ok } from "node:assert";
  import { randomUUID } from "node:crypto";
  import { EOL } from "node:os";
  import path from "node:path";
  import type { CompleteFileSystem } from "../storage/FileSystem.js";
  import type { SHA256 } from "./index.polyfill.js";
  export declare function createSHA256(): SHA256;
  export declare const defaultFS: CompleteFileSystem;
  export { EOL, ok, path, randomUUID };
}
