import { fs } from "@llamaindex/env";
import mammoth from "mammoth";
import { Document } from "../Node.js";
import type { FileReader } from "./type.js";

export class DocxReader implements FileReader {
  /** DocxParser */
  async loadData(file: string): Promise<Document[]> {
    const dataBuffer = await fs.readFile(file);
    const { value } = await mammoth.extractRawText({ buffer: dataBuffer });
    return [new Document({ text: value, id_: file })];
  }
}
