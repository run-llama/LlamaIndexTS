import { FileReader, ImageDocument } from "@llamaindex/core/schema";

/**
 * Reads the content of an image file into a Document object (which stores the image file as a Blob).
 */
export class ImageReader extends FileReader<ImageDocument> {
  /**
   * Public method for this reader.
   * Required by BaseReader interface.
   * @param fileContent - The content of the file.
   * @returns `Promise<Document[]>` A Promise object, eventually yielding zero or one ImageDocument of the specified file.
   */
  async loadDataAsContent(fileContent: Uint8Array): Promise<ImageDocument[]> {
    const blob = new Blob([fileContent]);
    return [new ImageDocument({ image: blob })];
  }
}
