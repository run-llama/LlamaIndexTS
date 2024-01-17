import { InMemoryFileSystem, type GenericFileSystem } from "./FileSystem.core";

export * from "./FileSystem.core.js";

export const genericFileSystem: GenericFileSystem = new InMemoryFileSystem();
