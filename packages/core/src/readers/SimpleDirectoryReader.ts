import type { CompleteFileSystem } from "@llamaindex/env";
import { defaultFS, path } from "@llamaindex/env";
import { Document } from "../Node.js";
import { walk } from "../storage/FileSystem.js";
import { PapaCSVReader } from "./CSVReader.js";
import { DocxReader } from "./DocxReader.js";
import { HTMLReader } from "./HTMLReader.js";
import { ImageReader } from "./ImageReader.js";
import { MarkdownReader } from "./MarkdownReader.js";
import { PDFReader } from "./PDFReader.js";
import type { BaseReader } from "./type.js";

type ReaderCallback = (
  category: "file" | "directory",
  name: string,
  status: ReaderStatus,
  message?: string,
) => boolean;
enum ReaderStatus {
  STARTED = 0,
  COMPLETE,
  ERROR,
}

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

export type SimpleDirectoryReaderLoadDataParams = {
  directoryPath: string;
  fs?: CompleteFileSystem;
  defaultReader?: BaseReader | null;
  fileExtToReader?: Record<string, BaseReader>;
};

/**
 * Read all the documents in a directory.
 * By default, supports the list of file types
 * in the FILE_EXT_TO_READER map.
 */
export class SimpleDirectoryReader implements BaseReader {
  constructor(private observer?: ReaderCallback) {}

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

    const {
      directoryPath,
      fs = defaultFS,
      defaultReader = new TextFileReader(),
      fileExtToReader = FILE_EXT_TO_READER,
    } = params;

    // Observer can decide to skip the directory
    if (
      !this.doObserverCheck("directory", directoryPath, ReaderStatus.STARTED)
    ) {
      return [];
    }

    const docs: Document[] = [];
    for await (const filePath of walk(fs, directoryPath)) {
      try {
        const fileExt = path.extname(filePath).slice(1).toLowerCase();

        // Observer can decide to skip each file
        if (!this.doObserverCheck("file", filePath, ReaderStatus.STARTED)) {
          // Skip this file
          continue;
        }

        let reader: BaseReader;

        if (fileExt in fileExtToReader) {
          reader = fileExtToReader[fileExt];
        } else if (defaultReader != null) {
          reader = defaultReader;
        } else {
          const msg = `No reader for file extension of ${filePath}`;
          console.warn(msg);

          // In an error condition, observer's false cancels the whole process.
          if (
            !this.doObserverCheck("file", filePath, ReaderStatus.ERROR, msg)
          ) {
            return [];
          }

          continue;
        }

        const fileDocs = await reader.loadData(filePath, fs);

        // Observer can still cancel addition of the resulting docs from this file
        if (this.doObserverCheck("file", filePath, ReaderStatus.COMPLETE)) {
          docs.push(...fileDocs);
        }
      } catch (e) {
        const msg = `Error reading file ${filePath}: ${e}`;
        console.error(msg);

        // In an error condition, observer's false cancels the whole process.
        if (!this.doObserverCheck("file", filePath, ReaderStatus.ERROR, msg)) {
          return [];
        }
      }
    }

    // After successful import of all files, directory completion
    // is only a notification for observer, cannot be cancelled.
    this.doObserverCheck("directory", directoryPath, ReaderStatus.COMPLETE);

    return docs;
  }

  private doObserverCheck(
    category: "file" | "directory",
    name: string,
    status: ReaderStatus,
    message?: string,
  ): boolean {
    if (this.observer) {
      return this.observer(category, name, status, message);
    }
    return true;
  }
}
