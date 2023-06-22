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
  exists(path: string): Promise<boolean>;
  mkdir(path: string, options?: any): Promise<void>;
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

  async exists(path: string): Promise<boolean> {
    return path in this.files;
  }

  async mkdir(path: string, options?: any): Promise<void> {
    this.files[path] = _.get(this.files, path, null);
  }
}

export function getNodeFS(): GenericFileSystem {
  const fs = require("fs/promises");
  return {
    exists: async (path: string) => {
      try {
        await fs.access(path);
        return true;
      } catch {
        return false;
      }
    },
    ...fs,
  };
}

let fs = null;
try {
  fs = getNodeFS();
} catch (e) {
  fs = new InMemoryFileSystem();
}
export const DEFAULT_FS = fs as GenericFileSystem;
