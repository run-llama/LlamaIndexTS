/**
 * Node.js built-in file system module.
 *
 * Bun, Deno support node:fs/promises so we don't need to re-implement it.
 *
 * @module
 */
import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";

export { createWriteStream, fs };
