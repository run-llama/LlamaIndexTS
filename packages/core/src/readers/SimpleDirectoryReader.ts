import { Document } from "../Node.js";
import { PapaCSVReader } from "./CSVReader.js";
import { DocxReader } from "./DocxReader.js";
import { HTMLReader } from "./HTMLReader.js";
import { ImageReader } from "./ImageReader.js";
import { MarkdownReader } from "./MarkdownReader.js";
import { PDFReader } from "./PDFReader.js";
import {
  SimpleDirectoryReader as EdgeSimpleDirectoryReader,
  type SimpleDirectoryReaderLoadDataParams,
} from "./SimpleDirectoryReader.edge.js";
import { TextFileReader } from "./TextFileReader.js";
import type { BaseReader } from "./type.js";

export const FILE_EXT_TO_READER: Record<string, BaseReader> = {
  txt: new TextFileReader(),
  pdf: new PDFReader(),
  csv: new PapaCSVReader(),
  md: new MarkdownReader(),
  docx: new DocxReader(),
  htm: new HTMLReader(),
  html: new HTMLReader(),
  jpg: new ImageReader(),
  jpeg: new ImageReader(),
  png: new ImageReader(),
  gif: new ImageReader(),
};

/**
 * Read all the documents in a directory.
 * By default, supports the list of file types
 * in the FILE_EXT_TO_READER map.
 */
export class SimpleDirectoryReader extends EdgeSimpleDirectoryReader {
  async loadData(
    params: SimpleDirectoryReaderLoadDataParams,
  ): Promise<Document[]>;
  async loadData(directoryPath: string): Promise<Document[]>;
  async loadData(
    params: SimpleDirectoryReaderLoadDataParams | string,
  ): Promise<Document[]> {
    if (typeof params === "string") {
      params = { directoryPath: params };
    }
    params.fileExtToReader = params.fileExtToReader ?? FILE_EXT_TO_READER;
    return super.loadData(params);
  }
}
