import { CompleteFileSystem } from "@llamaindex/env/type";
import { Document } from "../Node.js";

/**
 * A reader takes imports data into Document objects.
 */
export interface BaseReader {
  loadData(...args: unknown[]): Promise<Document[]>;
}

/**
 * A reader takes file paths and imports data into Document objects.
 */
export interface FileReader extends BaseReader {
  loadData(filePath: string, fs?: CompleteFileSystem): Promise<Document[]>;
}
