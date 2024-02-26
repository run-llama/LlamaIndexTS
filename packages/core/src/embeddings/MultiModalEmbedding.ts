import type { ImageType } from "../Node.js";
import { BaseEmbedding } from "./types.js";

/*
 * Base class for Multi Modal embeddings.
 */

export abstract class MultiModalEmbedding extends BaseEmbedding {
  abstract getImageEmbedding(images: ImageType): Promise<number[]>;

  async getImageEmbeddings(images: ImageType[]): Promise<number[][]> {
    return Promise.all(
      images.map((imgFilePath) => this.getImageEmbedding(imgFilePath)),
    );
  }
}
