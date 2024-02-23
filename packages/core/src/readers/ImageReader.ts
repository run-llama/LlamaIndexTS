import { defaultFS } from "@llamaindex/env";
import { GenericFileSystem } from "@llamaindex/env/type";
import { Document, ImageDocument } from "../Node.js";
import { FileReader } from "./type.js";

/**
 * Reads the content of an image file into a Document object (which stores the image file as a Blob).
 */
export class ImageReader implements FileReader {
  /**
   * Public method for this reader.
   * Required by BaseReader interface.
   * @param file Path/name of the file to be loaded.
   * @param fs fs wrapper interface for getting the file content.
   * @returns Promise<Document[]> A Promise object, eventually yielding zero or one ImageDocument of the specified file.
   */
  async loadData(
    file: string,
    fs: GenericFileSystem = defaultFS,
  ): Promise<Document[]> {
    const dataBuffer = await fs.readFile(file);
    const blob = new Blob([dataBuffer]);
    return [new ImageDocument({ image: blob, id_: file })];
  }
}
