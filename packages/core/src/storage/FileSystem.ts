import nodeFS from "node:fs/promises";
import { CompleteFileSystem } from "./FileSystem.core";

export * from "./FileSystem.core";

export const genericFileSystem: CompleteFileSystem = {
  readdir(path) {
    return nodeFS.readdir(path);
  },
  stat(path) {
    return nodeFS.stat(path);
  },
  access(path) {
    return nodeFS.access(path);
  },
  async mkdir(path, options) {
    await nodeFS.mkdir(path, options);
  },
  readFile(path, options) {
    return nodeFS.readFile(path, options) as any;
  },
  writeFile(path, content, options) {
    return nodeFS.writeFile(path, content, options);
  },
};
