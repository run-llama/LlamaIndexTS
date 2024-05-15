/**
 * Memory file system, used by edge runtime, worker runtime which doesn't have access to the file system.
 *
 * @module
 */
import { fs as memFS } from "memfs";

const fs = memFS.promises;

export { fs };
