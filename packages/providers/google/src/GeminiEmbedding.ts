import { GoogleGenAI, type GoogleGenAIOptions } from "@google/genai";
import { BaseEmbedding } from "@llamaindex/core/embeddings";
import { getEnv } from "@llamaindex/env";

export enum GEMINI_EMBEDDING_MODEL {
  EMBEDDING_001 = "embedding-001",
  TEXT_EMBEDDING_004 = "text-embedding-004",
}

export type GeminiEmbeddingOptions = {
  model?: GEMINI_EMBEDDING_MODEL;
  options?: GoogleGenAIOptions;
};

export class GeminiEmbedding extends BaseEmbedding {
  model: GEMINI_EMBEDDING_MODEL;
  ai: GoogleGenAI;

  constructor(init?: GeminiEmbeddingOptions) {
    super();

    const aiOptions = init?.options ?? { apiKey: getEnv("GOOGLE_API_KEY")! };
    if (!aiOptions.apiKey) {
      throw new Error("Set Google API Key in GOOGLE_API_KEY env variable");
    }

    this.ai = new GoogleGenAI(aiOptions);
    this.model = init?.model ?? GEMINI_EMBEDDING_MODEL.EMBEDDING_001;
  }

  async getTextEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    const result = await this.ai.models.embedContent({
      model: this.model,
      contents: texts,
    });

    return result.embeddings?.map((embedding) => embedding.values ?? []) ?? [];
  }

  async getTextEmbedding(text: string): Promise<number[]> {
    const result = await this.ai.models.embedContent({
      model: this.model,
      contents: text,
    });

    return result.embeddings?.[0]?.values ?? [];
  }
}
