import { fs } from "@llamaindex/env";

/**
 * Recursively traverses a directory and yields all the paths to the files in it.
 * @param dirPath The path to the directory to traverse.
 */
export async function* walk(dirPath: string): AsyncIterable<string> {
  const entries = await fs.readdir(dirPath);
  for (const entry of entries) {
    const fullPath = `${dirPath}/${entry}`;
    const stats = await fs.stat(fullPath);
    if (stats.isDirectory()) {
      yield* walk(fullPath);
    } else {
      yield fullPath;
    }
  }
}
