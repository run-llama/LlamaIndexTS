import type { BaseReader, FileReader } from "@llamaindex/core/schema";
import { Document } from "@llamaindex/core/schema";
import { path } from "@llamaindex/env";
import { walk } from "../storage/FileSystem.js";
import { TextFileReader } from "./TextFileReader.js";
import pLimit from "./utils.js";

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
  // Fallback Reader, defaults to TextFileReader
  defaultReader?: FileReader | null;
  // Map file extensions individually to readers
  fileExtToReader?: Record<string, FileReader>;
  // Number of workers, defaults to 1. Must be between 1 and 9.
  numWorkers?: number;
  // Overrides reader for all file extensions
  overrideReader?: FileReader;
};

type ProcessFileParams = Omit<
  SimpleDirectoryReaderLoadDataParams,
  "directoryPath"
>;

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
      defaultReader = new TextFileReader(),
      fileExtToReader,
      numWorkers = 1,
      overrideReader,
    } = params;

    if (numWorkers < 1 || numWorkers > 9) {
      throw new Error("The number of workers must be between 1 - 9.");
    }

    // Observer can decide to skip the directory
    if (
      !this.doObserverCheck("directory", directoryPath, ReaderStatus.STARTED)
    ) {
      return [];
    }

    // Crates a queue of file paths each worker accesses individually
    const filePathQueue: string[] = [];

    for await (const filePath of walk(directoryPath)) {
      filePathQueue.push(filePath);
    }

    const processFileParams: ProcessFileParams = {
      defaultReader,
      fileExtToReader,
      overrideReader,
    };

    // Uses pLimit to control number of parallel requests
    const limit = pLimit(numWorkers);
    const workerPromises = filePathQueue.map((filePath) =>
      limit(() => this.processFile(filePath, processFileParams)),
    );

    const results: Document[][] = await Promise.all(workerPromises);

    // After successful import of all files, directory completion
    // is only a notification for observer, cannot be cancelled.
    this.doObserverCheck("directory", directoryPath, ReaderStatus.COMPLETE);

    return results.flat();
  }

  private async processFile(
    filePath: string,
    params: ProcessFileParams,
  ): Promise<Document[]> {
    const docs: Document[] = [];

    try {
      const fileExt = path.extname(filePath).slice(1).toLowerCase();

      // Observer can decide to skip each file
      if (!this.doObserverCheck("file", filePath, ReaderStatus.STARTED)) {
        // Skip this file
        return [];
      }

      let reader: FileReader;

      if (params.overrideReader) {
        reader = params.overrideReader;
      } else if (params.fileExtToReader && fileExt in params.fileExtToReader) {
        reader = params.fileExtToReader[fileExt];
      } else if (params.defaultReader != null) {
        reader = params.defaultReader;
      } else {
        const msg = `No reader for file extension of ${filePath}`;
        console.warn(msg);

        // In an error condition, observer's false cancels the whole process.
        if (!this.doObserverCheck("file", filePath, ReaderStatus.ERROR, msg)) {
          return [];
        }

        return [];
      }

      const fileDocs = await reader.loadData(filePath);

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
