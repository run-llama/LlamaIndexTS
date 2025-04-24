import { OpenAIEmbedding } from "@llamaindex/openai";
import { AzureOpenAI as AzureOpenAILLM, type AzureClientOptions } from "openai";
import {
  AzureOpenAIWithUserAgent,
  getAzureConfigFromEnv,
  getAzureModel,
} from "./azure.js";

export class AzureOpenAIEmbedding extends OpenAIEmbedding {
  /**
   * Azure OpenAI Embedding
   * @param init - initial parameters
   */
  constructor(
    init?: Partial<OpenAIEmbedding> & {
      session?: AzureOpenAILLM;
      azure?: AzureClientOptions;
    },
  ) {
    const azureConfig = {
      ...getAzureConfigFromEnv({
        model: getAzureModel(init?.model ?? "text-embedding-ada-002"), // Use init model or default
      }),
      ...init?.azure,
    };

    // Call the base OpenAIEmbedding constructor, passing only the relevant init options
    super({
      ...init,
    });

    this.lazySession = async () => {
      if (init?.session) {
        return init?.session;
      }
      const AzureOpenAILib = AzureOpenAIWithUserAgent(AzureOpenAILLM);

      return new AzureOpenAILib({
        // Use base class properties for retries, timeout, etc.
        maxRetries: init?.maxRetries ?? 10,
        timeout: init?.timeout ?? 60 * 1000,
        ...init?.additionalSessionOptions,
        // Apply Azure specific config
        ...azureConfig,
      });
    };
  }
}
