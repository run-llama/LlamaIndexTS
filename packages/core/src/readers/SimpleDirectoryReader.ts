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

type ReaderCallback = (category: string, name: string, status: ReaderStatus, message?: string) => boolean;
enum ReaderStatus {
  Started = 0,
  Completed,
  Error
}

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

export const FILE_EXT_TO_READER: Record<string, BaseReader> = {
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
 * Read all of the documents in a directory. 
 * By default, supports the list of file types
 * in the FILE_EXIT_TO_READER map.
 */
export class SimpleDirectoryReader implements BaseReader {
  constructor(private observer?: ReaderCallback) {}

  async loadData({
    directoryPath,
    fs = DEFAULT_FS as CompleteFileSystem,
    defaultReader = new TextFileReader(),
    fileExtToReader = FILE_EXT_TO_READER,
  }: SimpleDirectoryReaderLoadDataProps): Promise<Document[]> {

    // Observer can decide to skip the directory
    if (this.doObserverCheck(
      'Directory', directoryPath, ReaderStatus.Started
    ) == false) {
      return Promise.reject('Cancelled');
    }

    let docs: Document[] = [];
    for await (const filePath of walk(fs, directoryPath)) {
      try {
        const fileExt = _.last(filePath.split(".")) || "";

        // Observer can decide to skip each file
        if (this.doObserverCheck(
          'File', filePath, ReaderStatus.Started
        ) == false) {
          // Skip this file
          continue;
        }    
    
        let reader = null;

        if (fileExt in fileExtToReader) {
          reader = fileExtToReader[fileExt];
        } else if (!_.isNil(defaultReader)) {
          reader = defaultReader;
        } else {
          const msg = `No reader for file extension of ${filePath}`;
          console.warn(msg);

          // In an error condition, observer's false cancels the whole process.
          if (this.doObserverCheck(
            'File', filePath, ReaderStatus.Error, msg
          ) == false) {
            return this.getCancelled();
          }
  
          continue;
        }

        const fileDocs = await reader.loadData(filePath, fs);

        // Observer can still cancel addition of the resulting docs from this file
        if (this.doObserverCheck(
          'File', filePath, ReaderStatus.Completed
        )) {   
          docs.push(...fileDocs);
        }      
      } catch (e) {
        const msg = `Error reading file ${filePath}: ${e}`;
        console.error(msg);

        // In an error condition, observer's false cancels the whole process.
        if (this.doObserverCheck(
          'File', filePath, ReaderStatus.Error, msg
        ) == false) {
          return this.getCancelled();
        }
      }
    }

    // After successful import of all files, directory completion
    // is only a notification for observer, cannot be cancelled.
    this.doObserverCheck(
      'Directory', directoryPath, ReaderStatus.Completed
    );

    return docs;
  }

  private getCancelled() {
    return Promise.reject('Cancelled');
  }

  private doObserverCheck(category: string, name: string, status: ReaderStatus, message?: string): boolean {
    if (this.observer) {
      return this.observer(category, name, status, message);
    }
    return true;
  }
}
