/**
 * Memory file system, used by edge runtime, worker runtime which doesn't have access to the file system.
 *
 * @module
 */
// @ts-expect-error
import memFS from "./memfs/index.js";

export const fs = memFS.promises;
