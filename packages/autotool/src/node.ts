/**
 * @example
 * ```shell
 * node --import @llamaindex/autotool/node ./dist/index.js
 * ```
 *
 * @example
 * ```shell
 * node --import tsx --import @llamaindex/autotool/node ./src/index.ts
 * ```
 *
 * @module
 */
import { register } from "node:module";

register("./loader.js", import.meta.url);
