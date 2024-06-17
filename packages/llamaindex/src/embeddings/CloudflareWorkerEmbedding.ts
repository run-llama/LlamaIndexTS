import type { ImageType } from "../Node.js";
import { MultiModalEmbedding } from "./MultiModalEmbedding.js";

/**
 * Cloudflare worker doesn't support image embeddings for now
 */
export class CloudflareWorkerMultiModalEmbedding extends MultiModalEmbedding {
  getImageEmbedding(images: ImageType): Promise<number[]> {
    throw new Error("Method not implemented.");
  }
  getTextEmbedding(text: string): Promise<number[]> {
    throw new Error("Method not implemented.");
  }
}
