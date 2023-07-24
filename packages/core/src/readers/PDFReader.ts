import { Document } from "../Node";
import { BaseReader } from "./base";
import { GenericFileSystem } from "../storage/FileSystem";
import { DEFAULT_FS } from "../storage/constants";
import pdfParse from "pdf-parse";
import _ from "lodash";

/**
 * Read the text of a PDF
 */
export class PDFReader implements BaseReader {
  async loadData(
    file: string,
    fs: GenericFileSystem = DEFAULT_FS
  ): Promise<Document[]> {
    const dataBuffer = (await fs.readFile(file)) as any;
    const data = await pdfParse(dataBuffer);
    return [new Document({ text: data.text, id_: file })];
  }
}
