/**
 * Copy/paste from `@xenova/transformers` dist and types folders
 *
 * @module
 */
import { runtime } from "std-env";
// @ts-expect-error
let transformer: typeof import("./transformers/transformers.js") | null = null;

export async function lazyLoadTransformers(): Promise<
  typeof import("@xenova/transformers")
> {
  if (!transformer) {
    // @ts-expect-error
    transformer = await import("./transformers/transformers.js");
  }

  if (runtime !== "node" && runtime !== "deno" && runtime !== "bun") {
    // there is no local file system for such runtimes
    transformer.env.allowLocalModels = false;
  }
  return transformer;
}
