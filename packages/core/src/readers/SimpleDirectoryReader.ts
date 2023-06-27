import _ from "lodash";
import { Document } from "../Document";
import { BaseReader } from "./base";
import { CompleteFileSystem, walk } from "../storage/FileSystem";
import { DEFAULT_FS } from "../storage/constants";
import PDFReader from "./PDFReader";

export class TextFileReader implements BaseReader {
  async loadData(
    file: string,
    fs: CompleteFileSystem = DEFAULT_FS as CompleteFileSystem
  ): Promise<Document[]> {
    const dataBuffer = await fs.readFile(file, "utf-8");
    return [new Document(dataBuffer, file)];
  }
}

const FILE_EXT_TO_READER: { [key: string]: BaseReader } = {
  txt: new TextFileReader(),
  pdf: new PDFReader(),
};

export type SimpleDirectoryReaderLoadDataProps = {
  directoryPath: string;
  fs?: CompleteFileSystem;
  defaultReader?: BaseReader | null;
  fileExtToReader?: { [key: string]: BaseReader };
};

export default class SimpleDirectoryReader implements BaseReader {
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
