import { OpenAIEmbedding } from "@llamaindex/openai";
import { lazySession, type AzureInitSession } from "./azure";

export class AzureOpenAIEmbedding extends OpenAIEmbedding {
  /**
   * Azure OpenAI Embedding
   * @param init - initial parameters
   */
  constructor(
    init?: Omit<Partial<OpenAIEmbedding>, "session"> & AzureInitSession,
  ) {
    super({
      ...init,
      session: undefined,
    });
    this.lazySession = lazySession(init);
  }
}
