import { InMemoryFileSystem, type GenericFileSystem } from "./FileSystem.core";

export * from "./FileSystem.core";

export const genericFileSystem: GenericFileSystem = new InMemoryFileSystem();
