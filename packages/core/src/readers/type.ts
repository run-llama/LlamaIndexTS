import { Document } from "../Node";
import { CompleteFileSystem } from "../storage";

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
