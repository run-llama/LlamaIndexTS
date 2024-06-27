import { Document } from "@llamaindex/core/schema";
import { FileReader } from "./type.js";

/**
 * Read a .txt file
 */

export class TextFileReader extends FileReader {
  async loadDataAsContent(fileContent: Uint8Array): Promise<Document[]> {
    const decoder = new TextDecoder("utf-8");
    const dataBuffer = decoder.decode(fileContent);
    return [new Document({ text: dataBuffer })];
  }
}
