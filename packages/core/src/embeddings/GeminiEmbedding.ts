import { GeminiSessionStore, type GeminiSession } from "../llm/gemini.js";
import { BaseEmbedding } from "./types.js";

export enum GEMINI_EMBEDDING_MODEL {
  EMBEDDING_001 = "embedding-001",
  TEXT_EMBEDDING_004 = "text-embedding-004",
}

/**
 * GeminiEmbedding is an alias for Gemini that implements the BaseEmbedding interface.
 */
export class GeminiEmbedding extends BaseEmbedding {
  model: GEMINI_EMBEDDING_MODEL;
  session: GeminiSession;

  constructor(init?: Partial<GeminiEmbedding>) {
    super();
    this.model = init?.model ?? GEMINI_EMBEDDING_MODEL.EMBEDDING_001;
    this.session = init?.session ?? GeminiSessionStore.get();
  }

  private async getEmbedding(prompt: string): Promise<number[]> {
    const client = this.session.gemini.getGenerativeModel({
      model: this.model,
    });
    const result = await client.embedContent(prompt);
    return result.embedding.values;
  }

  getTextEmbedding(text: string): Promise<number[]> {
    return this.getEmbedding(text);
  }

  getQueryEmbedding(query: string): Promise<number[]> {
    return this.getTextEmbedding(query);
  }
}
