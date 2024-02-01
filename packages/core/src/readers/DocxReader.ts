import mammoth from "mammoth";
import { Document } from "../Node";
import { defaultFS } from "../env";
import { GenericFileSystem } from "../storage/FileSystem";
import { BaseReader } from "./base";

export class DocxReader implements BaseReader {
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
