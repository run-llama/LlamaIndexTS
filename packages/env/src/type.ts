import _ from "lodash";

/**
 * A filesystem interface that is meant to be compatible with
 * the 'fs' module from Node.js.
 * Allows for the use of similar inteface implementation on
 * browsers.
 */
export type GenericFileSystem = {
  writeFile(path: string | URL, content: string): Promise<void>;
  /**
   * Reads a file and returns its content as a raw buffer.
   */
  readRawFile(path: string | URL): Promise<Buffer>;
  /**
   * Reads a file and returns its content as an utf-8 string.
   */
  readFile(path: string | URL): Promise<string>;
  access(path: string | URL): Promise<void>;
  mkdir(
    path: string | URL,
    options: {
      recursive: boolean;
    },
  ): Promise<string | undefined>;
  mkdir(path: string | URL): Promise<void>;
};
export type WalkableFileSystem = {
  readdir(path: string | URL): Promise<string[]>;
  stat(path: string | URL): Promise<any>;
};
export type CompleteFileSystem = GenericFileSystem & WalkableFileSystem;

/**
 * A filesystem implementation that stores files in memory.
 */
export class InMemoryFileSystem implements CompleteFileSystem {
  private files: Record<string, string> = {};

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

  async mkdir(path: string): Promise<undefined> {
    const content = _.get(this.files, path, null);
    if (content) {
      this.files[path] = content;
    }
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
