import { Document } from "../Document";
import { BaseReader } from "./base";
import { GenericFileSystem } from "../storage/FileSystem";
import { DEFAULT_FS } from "../storage/constants";
import { default as pdfParse } from "pdf-parse";
import _ from "lodash";

export class PDFReader implements BaseReader {
  async loadData(
    file: string,
    fs: GenericFileSystem = DEFAULT_FS
  ): Promise<Document> {
    let dataBuffer = (await fs.readFile(file)) as any;
    const data = await pdfParse(dataBuffer);
    return new Document(data.text, file);
  }
}
