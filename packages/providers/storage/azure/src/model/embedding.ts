import { OpenAIEmbedding } from "@llamaindex/openai";
import { AzureOpenAI as AzureOpenAILLM, type AzureClientOptions } from "openai";
import { AzureOpenAIWithUserAgent, getAzureConfigFromEnv } from "./azure.js";

export class AzureOpenAIEmbedding extends OpenAIEmbedding {
  /**
   * Azure OpenAI Embedding
   * @param init - initial parameters
   */
  constructor(
    init?: Partial<OpenAIEmbedding> &
      AzureClientOptions & {
        session?: AzureOpenAILLM;
      },
  ) {
    super({
      ...init,
    });

    this.lazySession = async () => {
      if (init?.session) {
        return init?.session;
      }
      const AzureOpenAILib = AzureOpenAIWithUserAgent(AzureOpenAILLM);

      const azureConfig = {
        ...getAzureConfigFromEnv(),
        ...init,
      };

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
