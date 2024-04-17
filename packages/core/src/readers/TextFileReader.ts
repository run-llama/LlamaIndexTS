import type { CompleteFileSystem } from "@llamaindex/env";
import { defaultFS } from "@llamaindex/env";
import { Document } from "../Node.js";
import type { BaseReader } from "./type.js";

/**
 * Read a .txt file
 */

export class TextFileReader implements BaseReader {
  async loadData(
    file: string,
    fs: CompleteFileSystem = defaultFS,
  ): Promise<Document[]> {
    const dataBuffer = await fs.readFile(file);
    return [new Document({ text: dataBuffer, id_: file })];
  }
}
