import { Document } from "../Node";
import { BaseReader } from "./base";
import { GenericFileSystem } from "../storage/FileSystem";
import { DEFAULT_FS } from "../storage/constants";
import _ from "lodash";

/**
 * Read the text of a PDF
 */
export class PDFReader implements BaseReader {
  async loadData(
    file: string,
    fs: GenericFileSystem = DEFAULT_FS
  ): Promise<Document[]> {
    throw new Error("not implemented");
  }
}
