import { defaultFS } from "#llamaindex/env";
import mammoth from "mammoth";
import { Document } from "../Node.js";
import { GenericFileSystem } from "../storage/FileSystem.js";
import { FileReader } from "./type.js";

export class DocxReader implements FileReader {
  /** DocxParser */
  async loadData(
    file: string,
    fs: GenericFileSystem = defaultFS,
  ): Promise<Document[]> {
    const dataBuffer = await fs.readRawFile(file);
    const { value } = await mammoth.extractRawText({ buffer: dataBuffer });
    return [new Document({ text: value, id_: file })];
  }
}
