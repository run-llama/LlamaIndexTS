import {
  ImageNode,
  MetadataMode,
  ModalityType,
  splitNodesByType,
  type BaseNode,
  type ImageType,
} from "../Node.js";
import { BaseEmbedding, batchEmbeddings } from "./types.js";

/*
 * Base class for Multi Modal embeddings.
 */

export abstract class MultiModalEmbedding extends BaseEmbedding {
  abstract getImageEmbedding(images: ImageType): Promise<number[]>;

  /**
   * Optionally override this method to retrieve multiple image embeddings in a single request
   * @param texts
   */
  async getImageEmbeddings(images: ImageType[]): Promise<number[][]> {
    return Promise.all(
      images.map((imgFilePath) => this.getImageEmbedding(imgFilePath)),
    );
  }

  async transform(nodes: BaseNode[], _options?: any): Promise<BaseNode[]> {
    const nodeMap = splitNodesByType(nodes);
    const imageNodes = nodeMap[ModalityType.IMAGE] ?? [];
    const textNodes = nodeMap[ModalityType.TEXT] ?? [];

    const embeddings = await batchEmbeddings(
      textNodes.map((node) => node.getContent(MetadataMode.EMBED)),
      this.getTextEmbeddings.bind(this),
      this.embedBatchSize,
      _options,
    );
    for (let i = 0; i < textNodes.length; i++) {
      textNodes[i].embedding = embeddings[i];
    }

    const imageEmbeddings = await batchEmbeddings(
      imageNodes.map((n) => (n as ImageNode).image),
      this.getImageEmbeddings.bind(this),
      this.embedBatchSize,
      _options,
    );
    for (let i = 0; i < imageNodes.length; i++) {
      imageNodes[i].embedding = imageEmbeddings[i];
    }

    return nodes;
  }
}
