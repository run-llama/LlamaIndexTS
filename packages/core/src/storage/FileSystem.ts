import _ from "lodash";
/**
 * A filesystem interface that is meant to be compatible with
 * the 'fs' module from Node.js.
 * Allows for the use of similar inteface implementation on
 * browsers.
 */

export interface GenericFileSystem {
  writeFile(path: string, content: string, options?: any): Promise<void>;
  readFile(path: string, options?: any): Promise<string>;
  access(path: string): Promise<void>;
  mkdir(path: string, options?: any): Promise<void>;
}

export interface WalkableFileSystem {
  readdir(path: string): Promise<string[]>;
  stat(path: string): Promise<any>;
}

/**
 * A filesystem implementation that stores files in memory.
 */
export class InMemoryFileSystem implements GenericFileSystem {
  private files: { [filepath: string]: any } = {};

  async writeFile(path: string, content: string, options?: any): Promise<void> {
    this.files[path] = _.cloneDeep(content);
  }

  async readFile(path: string, options?: any): Promise<string> {
    if (!(path in this.files)) {
      throw new Error(`File ${path} does not exist`);
    }
    return _.cloneDeep(this.files[path]);
  }

  async access(path: string): Promise<void> {
    if (!(path in this.files)) {
      throw new Error(`File ${path} does not exist`);
    }
  }

  async mkdir(path: string, options?: any): Promise<void> {
    this.files[path] = _.get(this.files, path, null);
  }
}

export type CompleteFileSystem = GenericFileSystem & WalkableFileSystem;

export function getNodeFS(): CompleteFileSystem {
  const fs = require("fs/promises");
  return fs;
}

let fs = null;
try {
  fs = getNodeFS();
} catch (e) {
  fs = new InMemoryFileSystem();
}
export const DEFAULT_FS: GenericFileSystem | CompleteFileSystem =
  fs as GenericFileSystem;

// FS utility functions

/**
 * Checks if a file exists.
 * Analogous to the os.path.exists function from Python.
 * @param fs The filesystem to use.
 * @param path The path to the file to check.
 * @returns A promise that resolves to true if the file exists, false otherwise.
 */
export async function exists(
  fs: GenericFileSystem,
  path: string
): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Recursively traverses a directory and yields all the paths to the files in it.
 * @param fs The filesystem to use.
 * @param dirPath The path to the directory to traverse.
 */
export async function* walk(
  fs: WalkableFileSystem,
  dirPath: string
): AsyncIterable<string> {
  if (fs instanceof InMemoryFileSystem) {
    throw new Error(
      "The InMemoryFileSystem does not support directory traversal."
    );
  }

  const entries = await fs.readdir(dirPath);
  for (const entry of entries) {
    const fullPath = `${dirPath}/${entry}`;
    const stats = await fs.stat(fullPath);
    if (stats.isDirectory()) {
      yield* walk(fs, fullPath);
    } else {
      yield fullPath;
    }
  }
}
