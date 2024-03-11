import { MistralAISession } from "../llm/mistral.js";
import { BaseEmbedding } from "./types.js";

export enum MistralAIEmbeddingModelType {
  MISTRAL_EMBED = "mistral-embed",
}

export class MistralAIEmbedding extends BaseEmbedding {
  model: MistralAIEmbeddingModelType;
  apiKey?: string;

  private session: MistralAISession;

  constructor(init?: Partial<MistralAIEmbedding>) {
    super();
    this.model = MistralAIEmbeddingModelType.MISTRAL_EMBED;
    this.session = new MistralAISession(init);
  }

  private async getMistralAIEmbedding(input: string) {
    const client = await this.session.getClient();
    const { data } = await client.embeddings({
      model: this.model,
      input: [input],
    });

    return data[0].embedding;
  }

  async getTextEmbedding(text: string): Promise<number[]> {
    return this.getMistralAIEmbedding(text);
  }

  async getQueryEmbedding(query: string): Promise<number[]> {
    return this.getMistralAIEmbedding(query);
  }
}
