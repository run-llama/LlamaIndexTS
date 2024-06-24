import type { Document } from "../Node.js";
import { ImageDocument } from "../Node.js";
import { FileReader } from "./type.js";

/**
 * Reads the content of an image file into a Document object (which stores the image file as a Blob).
 */
export class ImageReader extends FileReader {
  /**
   * Public method for this reader.
   * Required by BaseReader interface.
   * @param file Path/name of the file to be loaded.
   * @param fs fs wrapper interface for getting the file content.
   * @returns Promise<Document[]> A Promise object, eventually yielding zero or one ImageDocument of the specified file.
   */
  async loadDataAsContent(fileContent: Buffer): Promise<Document[]> {
    const blob = new Blob([fileContent]);
    return [new ImageDocument({ image: blob })];
  }
}
