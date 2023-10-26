import _ from "lodash";
import { Document } from "../Node";
import { DEFAULT_FS } from "../storage/constants";
import { CompleteFileSystem, walk } from "../storage/FileSystem";
import { BaseReader } from "./base";
import { PapaCSVReader } from "./CSVReader";
import { DocxReader } from "./DocxReader";
import { HTMLReader } from "./HTMLReader";
import { MarkdownReader } from "./MarkdownReader";
import { PDFReader } from "./PDFReader";

/**
 * Read a .txt file
 */
export class TextFileReader implements BaseReader {
  async loadData(
    file: string,
    fs: CompleteFileSystem = DEFAULT_FS as CompleteFileSystem,
  ): Promise<Document[]> {
    const dataBuffer = await fs.readFile(file, "utf-8");
    return [new Document({ text: dataBuffer, id_: file })];
  }
}

const FILE_EXT_TO_READER: Record<string, BaseReader> = {
  txt: new TextFileReader(),
  pdf: new PDFReader(),
  csv: new PapaCSVReader(),
  md: new MarkdownReader(),
  docx: new DocxReader(),
  htm: new HTMLReader(),
  html: new HTMLReader(),
};

export type SimpleDirectoryReaderLoadDataProps = {
  directoryPath: string;
  fs?: CompleteFileSystem;
  defaultReader?: BaseReader | null;
  fileExtToReader?: Record<string, BaseReader>;
};

/**
 * Read all of the documents in a directory. Currently supports PDF and TXT files.
 */
export class SimpleDirectoryReader implements BaseReader {
  async loadData({
    directoryPath,
    fs = DEFAULT_FS as CompleteFileSystem,
    defaultReader = new TextFileReader(),
    fileExtToReader = FILE_EXT_TO_READER,
  }: SimpleDirectoryReaderLoadDataProps): Promise<Document[]> {
    let docs: Document[] = [];
    for await (const filePath of walk(fs, directoryPath)) {
      try {
        const fileExt = _.last(filePath.split(".")) || "";

        let reader = null;

        if (fileExt in fileExtToReader) {
          reader = fileExtToReader[fileExt];
        } else if (!_.isNil(defaultReader)) {
          reader = defaultReader;
        } else {
          console.warn(`No reader for file extension of ${filePath}`);
          continue;
        }

        const fileDocs = await reader.loadData(filePath, fs);
        docs.push(...fileDocs);
      } catch (e) {
        console.error(`Error reading file ${filePath}: ${e}`);
      }
    }
    return docs;
  }
}
