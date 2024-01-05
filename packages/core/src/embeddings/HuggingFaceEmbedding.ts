import { BaseEmbedding } from "./types";

export enum HuggingFaceEmbeddingModelType {
  XENOVA_ALL_MINILM_L6_V2 = "Xenova/all-MiniLM-L6-v2",
}

export class HuggingFaceEmbedding extends BaseEmbedding {
  modelType: HuggingFaceEmbeddingModelType =
    HuggingFaceEmbeddingModelType.XENOVA_ALL_MINILM_L6_V2;

  private extractor: any;

  async getExtractor() {
    if (!this.extractor) {
      const { pipeline } = await import("@xenova/transformers");
      this.extractor = await pipeline("feature-extraction", this.modelType);
    }
    return this.extractor;
  }

  async getTextEmbedding(text: string): Promise<number[]> {
    const extractor = await this.getExtractor();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return output.data;
  }

  async getQueryEmbedding(query: string): Promise<number[]> {
    return this.getTextEmbedding(query);
  }
}
