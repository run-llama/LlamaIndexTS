import { OpenAIResponses } from "@llamaindex/openai";
import type { AzureClientOptions, AzureOpenAI as AzureOpenAILLM } from "openai";
import {
  AzureOpenAIWithUserAgent,
  getAzureConfigFromEnv,
  getAzureModel,
} from "./azure.js";

export class AzureOpenAIResponses extends OpenAIResponses {
  /**
   * Azure OpenAI Responses
   * @param init - initial parameters
   */
  constructor(
    init?: Partial<OpenAIResponses> & {
      session?: AzureOpenAILLM | undefined;
      azure?: AzureClientOptions;
    },
  ) {
    const azureConfig = {
      ...getAzureConfigFromEnv({
        model: getAzureModel(init?.model ?? "gpt-4o"), // Use init model or default
      }),
      ...init?.azure,
    };

    // Call the base OpenAIResponses constructor
    super({
      ...init,
    });

    // Define the Azure-specific lazySession logic after the super() call
    this.lazySession = async () =>
      import("openai").then(async ({ AzureOpenAI }) => {
        AzureOpenAI = AzureOpenAIWithUserAgent(AzureOpenAI);

        return (
          init?.session ??
          new AzureOpenAI({
            // Use base class properties for retries, timeout, etc.
            maxRetries: this.maxRetries,
            timeout: this.timeout!,
            ...this.additionalSessionOptions,
            // Apply Azure specific config
            ...azureConfig,
          })
        );
      });
  }
}
