import { BaseEmbedding } from "@llamaindex/core/embeddings";
import { GeminiSession, GeminiSessionStore } from "./base.js";
import { GEMINI_BACKENDS } from "./types.js";

export enum GEMINI_EMBEDDING_MODEL {
  EMBEDDING_001 = "embedding-001",
  TEXT_EMBEDDING_004 = "text-embedding-004",
}

/**
 * GeminiEmbedding is an alias for Gemini that implements the BaseEmbedding interface.
 * Note: Vertex SDK currently does not support embeddings
 */
export class GeminiEmbedding extends BaseEmbedding {
  model: GEMINI_EMBEDDING_MODEL;
  session: GeminiSession;

  apiKey?: string; // Added for clarity, though session handles it

  constructor(init?: Partial<GeminiEmbedding> & { apiKey?: string }) {
    super();
    this.model = init?.model ?? GEMINI_EMBEDDING_MODEL.EMBEDDING_001;
    this.apiKey = init?.apiKey; // Store apiKey if provided
    this.session =
      init?.session ??
      (GeminiSessionStore.get(
        { backend: GEMINI_BACKENDS.GOOGLE, apiKey: this.apiKey }, // Use stored or passed apiKey
        { model: this.model }, // Pass modelParams
      ) as GeminiSession);
  }

  private async getEmbedding(prompt: string): Promise<number[]> {
    // getGenerativeModel no longer takes arguments
    const client = this.session.getGenerativeModel();
    const result = await client.embedContent(prompt);
    return result.embedding.values;
  }

  getTextEmbedding(text: string): Promise<number[]> {
    return this.getEmbedding(text);
  }
}
