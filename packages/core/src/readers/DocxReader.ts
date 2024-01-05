import mammoth from "mammoth";
import { Document } from "../Node";
import { GenericFileSystem } from "../storage/FileSystem";
import { DEFAULT_FS } from "../storage/constants";
import { BaseReader } from "./base";

export class DocxReader implements BaseReader {
  /** DocxParser */
  async loadData(
    file: string,
    fs: GenericFileSystem = DEFAULT_FS,
  ): Promise<Document[]> {
    const dataBuffer = (await fs.readFile(file)) as any;
    const { value } = await mammoth.extractRawText({ buffer: dataBuffer });
    return [new Document({ text: value, id_: file })];
  }
}
