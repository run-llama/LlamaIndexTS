import _ from "lodash";

/**
 * A filesystem interface that is meant to be compatible with
 * the 'fs' module from Node.js.
 * Allows for the use of similar inteface implementation on
 * browsers.
 */
export type GenericFileSystem = {
  writeFile(path: string, content: string): Promise<void>;
  /**
   * Reads a file and returns its content as a raw buffer.
   */
  readRawFile(path: string): Promise<Buffer>;
  /**
   * Reads a file and returns its content as an utf-8 string.
   */
  readFile(path: string): Promise<string>;
  access(path: string): Promise<void>;
  mkdir(
    path: string,
    options: {
      recursive: boolean;
    },
  ): Promise<string | undefined>;
  mkdir(path: string): Promise<void>;
};

export type WalkableFileSystem = {
  readdir(path: string): Promise<string[]>;
  stat(path: string): Promise<any>;
};

export type CompleteFileSystem = GenericFileSystem & WalkableFileSystem;

/**
 * A filesystem implementation that stores files in memory.
 */
export class InMemoryFileSystem implements CompleteFileSystem {
  private files: Record<string, any> = {};

  async writeFile(
    path: string,
    content: string,
    options?: unknown,
  ): Promise<void> {
    this.files[path] = _.cloneDeep(content);
  }

  async readFile(path: string): Promise<string> {
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

  async mkdir(path: string) {
    this.files[path] = _.get(this.files, path, null);
    return undefined;
  }

  async readdir(path: string): Promise<string[]> {
    throw new Error("Not implemented");
  }

  async stat(path: string): Promise<any> {
    throw new Error("Not implemented");
  }

  async readRawFile(path: string): Promise<Buffer> {
    throw new Error("Not implemented");
  }
}

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
  path: string,
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
  dirPath: string,
): AsyncIterable<string> {
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
