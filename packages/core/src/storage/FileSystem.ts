/**
 * A filesystem interface that is meant to be compatible with
 * the 'fs' module from Node.js.
 * Allows for the use of similar inteface implementation on
 * browsers.
 */

export interface GenericFileSystem {
  writeFile(path: string, content: string, options?: any): Promise<void>;
  readFile(path: string, options?: any): Promise<string>;
  exists(path: string): Promise<boolean>;
  mkdir(path: string, options?: any): Promise<void>;
}

/**
 * A filesystem implementation that stores files in memory.
 */
export class InMemoryFileSystem implements GenericFileSystem {
  private files: {[filepath: string]: string} = {};

  async writeFile(path: string, content: string, options?: any): Promise<void> {
    this.files[path] = content;
  }

  async readFile(path: string, options?: any): Promise<string> {
    if (!(path in this.files)) {
      throw new Error(`File ${path} does not exist`);
    }
    return this.files[path];
  }

  async exists(path: string): Promise<boolean> {
    return path in this.files;
  }

  async mkdir(path: string, options?: any): Promise<void> {
    // noop
  }
}
