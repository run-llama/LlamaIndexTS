import { fs } from "@llamaindex/env";
import { Document } from "../Node.js";
import type { FileReader } from "./type.js";

/**
 * Read a .txt file
 */

export class TextFileReader implements FileReader {
  async loadData(file: string): Promise<Document[]> {
    const dataBuffer = await fs.readFile(file, "utf-8");
    return [new Document({ text: dataBuffer, id_: file })];
  }
}
