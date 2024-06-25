import mammoth from "mammoth";
import { Document } from "../Node.js";
import { FileReader } from "./type.js";

export class DocxReader extends FileReader {
  /** DocxParser */
  async loadDataAsContent(fileContent: Buffer): Promise<Document[]> {
    const { value } = await mammoth.extractRawText({ buffer: fileContent });
    return [new Document({ text: value })];
  }
}
