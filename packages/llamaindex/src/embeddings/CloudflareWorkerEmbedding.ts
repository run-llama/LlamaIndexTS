import { MultiModalEmbedding } from "@llamaindex/core/embeddings";
import type { ImageType } from "@llamaindex/core/schema";

/**
 * Cloudflare worker doesn't support image embeddings for now
 */
export class CloudflareWorkerMultiModalEmbedding extends MultiModalEmbedding {
  constructor() {
    super();
  }
  getImageEmbedding(images: ImageType): Promise<number[]> {
    throw new Error("Method not implemented.");
  }
  getTextEmbedding(text: string): Promise<number[]> {
    throw new Error("Method not implemented.");
  }
}
