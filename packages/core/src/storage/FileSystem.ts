import nodeFS from "node:fs/promises";
import type { GenericFileSystem } from "./FileSystem.core";

export * from "./FileSystem.core";

export const genericFileSystem: GenericFileSystem = {
  access(path) {
    return nodeFS.access(path);
  },
  async mkdir(path, options) {
    await nodeFS.mkdir(path, options);
  },
  readFile(path, options) {
    return nodeFS.readFile(path, options).then((buffer) => buffer.toString());
  },
  writeFile(path, content, options) {
    return nodeFS.writeFile(path, content, options);
  },
};
