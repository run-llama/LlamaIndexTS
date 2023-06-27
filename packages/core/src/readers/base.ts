import { Document } from "../Document";

export interface BaseReader {
  loadData(...args: any[]): Promise<Document[]>;
}
