import { Document } from "../Node";

/**
 * A reader takes imports data into Document objects.
 */
export interface BaseReader {
  loadData(...args: any[]): Promise<Document[]>;
}
