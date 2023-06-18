/**
 * A filesystem interface that is meant to be compatible with
 * the 'fs' module from Node.js.
 * Allows for the use of similar inteface implementation on
 * browsers.
 */

export interface GenericFileSystem {
  writeFile(path: string, options: any): Promise<void>;
  readFile(path: string, options: any): Promise<string>;
}
