import type { FileReader } from "@llamaindex/core/schema";
import { Document } from "@llamaindex/core/schema";
import { CSVReader } from "../csv";
import { DocxReader } from "../docx";
import { HTMLReader } from "../html.js";
import { ImageReader } from "../image";
import { MarkdownReader } from "../markdown";
import { PDFReader } from "../pdf";
import { TextFileReader } from "../text";
import {
  AbstractSimpleDirectoryReader,
  type SimpleDirectoryReaderLoadDataParams,
} from "./base";

export const FILE_EXT_TO_READER: Record<string, FileReader> = {
  txt: new TextFileReader(),
  pdf: new PDFReader(),
  csv: new CSVReader(),
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
export class SimpleDirectoryReader extends AbstractSimpleDirectoryReader {
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
