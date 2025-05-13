import { OpenAI } from "@llamaindex/openai";
import { type AzureClientOptions, AzureOpenAI as AzureOpenAILLM } from "openai";
import { AzureOpenAIWithUserAgent, getAzureConfigFromEnv } from "./azure";

export class AzureOpenAI extends OpenAI {
  constructor(
    init?: Partial<OpenAI> &
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
