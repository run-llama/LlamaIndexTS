import { Document } from "../Node.js";
import { FileReader } from "./type.js";

/**
 * Read a .txt file
 */

export class TextFileReader extends FileReader {
  async loadDataAsContent(fileContent: Buffer): Promise<Document[]> {
    const dataBuffer = fileContent.toString("utf-8");
    return [new Document({ text: dataBuffer })];
  }
}
