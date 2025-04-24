import { OpenAI } from "@llamaindex/openai";
import { type AzureClientOptions, AzureOpenAI as AzureOpenAILLM } from "openai";
import {
  AzureOpenAIWithUserAgent,
  getAzureConfigFromEnv,
  getAzureModel,
} from "./azure";

export class AzureOpenAI extends OpenAI {
  constructor(
    init?: Partial<OpenAI> & {
      session?: AzureOpenAILLM;
      azure?: AzureClientOptions;
    },
  ) {
    const azureConfig = {
      ...getAzureConfigFromEnv({
        model: getAzureModel(init?.model ?? "gpt-4o"), // Use init model or default
      }),
      ...init?.azure,
    };

    // Call the base OpenAI constructor, but override lazySession for Azure
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
