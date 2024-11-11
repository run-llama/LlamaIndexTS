import { BaseEmbedding } from "@llamaindex/core/embeddings";
import { Ollama, type OllamaParams } from "./llm";

export class OllamaEmbedding extends BaseEmbedding {
  private readonly llm: Ollama;

  constructor(params: OllamaParams) {
    super();
    this.llm = new Ollama(params);
  }

  private async getEmbedding(prompt: string): Promise<number[]> {
    const payload = {
      model: this.llm.model,
      prompt,
      options: {
        ...this.llm.options,
      },
    };
    const response = await this.llm.ollama.embeddings({
      ...payload,
    });
    return response.embedding;
  }

  async getTextEmbedding(text: string): Promise<number[]> {
    return this.getEmbedding(text);
  }
}
