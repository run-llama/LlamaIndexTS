import { fs, path } from "@llamaindex/env";
import { Document } from "./node";

/**
 * A reader takes imports data into Document objects.
 */
export interface BaseReader {
  loadData(...args: unknown[]): Promise<Document[]>;
}

/**
 * A FileReader takes file paths and imports data into Document objects.
 */
export abstract class FileReader implements BaseReader {
  abstract loadDataAsContent(
    fileContent: Uint8Array,
    fileName?: string,
  ): Promise<Document[]>;

  async loadData(filePath: string): Promise<Document[]> {
    // XXX: create a new Uint8Array to prevent "Please provide binary data as `Uint8Array`, rather than `Buffer`." error in PDFReader
    const fileContent = new Uint8Array(await fs.readFile(filePath));
    const fileName = path.basename(filePath);
    const docs = await this.loadDataAsContent(fileContent, fileName);
    docs.forEach(FileReader.addMetaData(filePath));
    return docs;
  }

  static addMetaData(filePath: string) {
    return (doc: Document, index: number) => {
      // generate id as loadDataAsContent is only responsible for the content
      doc.id_ = `${filePath}_${index + 1}`;
      doc.metadata["file_path"] = path.resolve(filePath);
      doc.metadata["file_name"] = path.basename(filePath);
    };
  }
}
