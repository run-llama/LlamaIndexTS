import { Document } from "../Node";

export interface BaseReader {
  loadData(...args: any[]): Promise<Document[]>;
}
