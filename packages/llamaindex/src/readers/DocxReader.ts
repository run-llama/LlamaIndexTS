import mammoth from "mammoth";
import { Document } from "../Node.js";
import { FileReader } from "./type.js";

export class DocxReader extends FileReader {
  /** DocxParser */
  async loadDataAsContent(fileContent: Uint8Array): Promise<Document[]> {
    // Note: await mammoth.extractRawText({ arrayBuffer: fileContent });  is not working
    // So we need to convert to Buffer first
    const buffer = Buffer.from(fileContent);
    const { value } = await mammoth.extractRawText({ buffer });
    return [new Document({ text: value })];
  }
}
