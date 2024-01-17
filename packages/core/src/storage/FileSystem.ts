import fs from "node:fs/promises";
import type { GenericFileSystem } from "./FileSystem.core";

export * from "./FileSystem.core.js";

export const DEFAULT_FS: GenericFileSystem = fs;
