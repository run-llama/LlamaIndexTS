import { getEnv } from "@llamaindex/env";
import { OpenAI } from "@llamaindex/openai";
import { BASE_URL, ENV_VARIABLE_NAME } from "./utils";

export class OVHcloudLLM extends OpenAI {
  constructor(init?: Omit<Partial<OpenAI>, "session">) {
    const {
      apiKey = getEnv(ENV_VARIABLE_NAME) ?? "",
      additionalSessionOptions = {},
      model = "gpt-oss-120b",
      ...rest
    } = init ?? {};

    // OVHcloud allows empty API key for free tier with rate limits
    // So we don't throw an error if apiKey is empty or undefined

    additionalSessionOptions.baseURL =
      additionalSessionOptions.baseURL ?? BASE_URL;

    super({
      apiKey: apiKey || "", // Use empty string if not provided
      additionalSessionOptions,
      model,
      ...rest,
    });
  }
}

/**
 * Convenience function to create a new OVHcloudLLM instance.
 * @param init - Optional initialization parameters for the OVHcloudLLM instance.
 * @returns A new OVHcloudLLM instance.
 */
export const ovhcloud = (init?: ConstructorParameters<typeof OVHcloudLLM>[0]) =>
  new OVHcloudLLM(init);
