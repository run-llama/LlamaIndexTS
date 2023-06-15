import { Document } from "./Document";

export interface BaseReader {
  loadData(...args: any[]): Promise<Document>;
}

export class SimpleDirectoryReader implements BaseReader {
  async loadData(options) {
    return new Document("1", "");
  }
}

export class PDFReader implements BaseReader {
  async loadData(options) {
    return new Document("1", "");
  }
}
