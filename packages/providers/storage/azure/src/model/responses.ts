import { OpenAIResponses } from "@llamaindex/openai";
import { lazySession, type AzureInitSession } from "./azure.js";

export class AzureOpenAIResponses extends OpenAIResponses {
  /**
   * Azure OpenAI Responses
   * @param init - initial parameters
   */
  constructor(
    init?: Omit<Partial<OpenAIResponses>, "session"> & AzureInitSession,
  ) {
    super({
      ...init,
      session: undefined,
    });
    this.lazySession = lazySession(init);
  }
}
