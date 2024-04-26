import {
  GEMINI_MODEL,
  GeminiSessionStore,
  type GeminiConfig,
  type GeminiSession,
} from "../llm/gemini.js";
import { BaseEmbedding } from "./types.js";

/**
 * GeminiEmbedding is an alias for Gemini that implements the BaseEmbedding interface.
 */
export class GeminiEmbedding extends BaseEmbedding {
  model: GEMINI_MODEL;
  temperature: number;
  topP: number;
  maxTokens?: number;
  session: GeminiSession;

  constructor(init?: GeminiConfig) {
    super();
    this.model = init?.model ?? GEMINI_MODEL.GEMINI_PRO;
    this.temperature = init?.temperature ?? 0.1;
    this.topP = init?.topP ?? 1;
    this.maxTokens = init?.maxTokens ?? undefined;
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
