import { path } from "@llamaindex/env";
import { Document, type Metadata } from "../Node.js";
import { walk } from "../storage/FileSystem.js";
import { LlamaParseReader } from "./LlamaParseReader.js";
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

export type SimpleDirectoryReaderLoadDataParams = {
  directoryPath: string;
  fs?: CompleteFileSystem;
  defaultReader?: BaseReader;
  fileExtToReader?: Record<string, BaseReader>;
  numWorkers?: number;
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
      defaultReader,
      fileExtToReader,
      numWorkers = 1,
    } = params;

    // Check if LlamaParseReader is used as the defaultReader and if so checks if numWorkers is in the valid range
    if (defaultReader instanceof LlamaParseReader && numWorkers > 9) {
      throw new Error("Currently, LlamaParse supports a maximum of 9 workers.");
    }

    // Observer can decide to skip the directory
    if (
      !this.doObserverCheck("directory", directoryPath, ReaderStatus.STARTED)
    ) {
      return [];
    }

    const docs: Document[] = [];
    const filePathQueue: string[] = [];

    for await (const filePath of walk(fs, directoryPath)) {
      filePathQueue.push(filePath);
    }

    const workerPromises = Array.from({ length: numWorkers }, () =>
      this.processFiles(filePathQueue, fs, defaultReader, fileExtToReader),
    );

    const results = await Promise.all(workerPromises);
    docs.push(...results.flat());

    // After successful import of all files, directory completion
    // is only a notification for observer, cannot be cancelled.
    this.doObserverCheck("directory", directoryPath, ReaderStatus.COMPLETE);

    return docs;
  }

  private async processFiles(
    filePathQueue: string[],
    fs: CompleteFileSystem,
    defaultReader: BaseReader | undefined,
    fileExtToReader?: Record<string, BaseReader>,
  ): Promise<Document[]> {
    const docs: Document[] = [];

    while (filePathQueue.length > 0) {
      const filePath = filePathQueue.shift()!;

      try {
        const fileExt = path.extname(filePath).slice(1).toLowerCase();

        // Observer can decide to skip each file
        if (!this.doObserverCheck("file", filePath, ReaderStatus.STARTED)) {
          // Skip this file
          continue;
        }

        let reader: BaseReader;

        if (defaultReader) {
          reader = defaultReader;
        } else if (fileExtToReader && fileExt in fileExtToReader) {
          reader = fileExtToReader[fileExt];
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
        fileDocs.forEach(addMetaData(filePath));

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

function addMetaData(filePath: string): (doc: Document<Metadata>) => void {
  return (doc: Document<Metadata>) => {
    doc.metadata["file_path"] = path.resolve(filePath);
    doc.metadata["file_name"] = path.basename(filePath);
  };
}
