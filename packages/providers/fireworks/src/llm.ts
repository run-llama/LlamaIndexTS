import { getEnv } from "@llamaindex/env";
import { OpenAI } from "@llamaindex/openai";

export class FireworksLLM extends OpenAI {
  constructor(init?: Omit<Partial<OpenAI>, "session">) {
    const {
      apiKey = getEnv("FIREWORKS_API_KEY"),
      additionalSessionOptions = {},
      model = "accounts/fireworks/models/mixtral-8x7b-instruct",
      ...rest
    } = init ?? {};

    if (!apiKey) {
      throw new Error("Set Fireworks API Key in FIREWORKS_AI_KEY env variable");
    }

    additionalSessionOptions.baseURL =
      additionalSessionOptions.baseURL ??
      "https://api.fireworks.ai/inference/v1";

    super({
      apiKey,
      additionalSessionOptions,
      model,
      ...rest,
    });
  }
}

/**
 * Convenience function to create a new FireworksLLM instance.
 * @param init - Optional initialization parameters for the FireworksLLM instance.
 * @returns A new FireworksLLM instance.
 */
export const fireworks = (
  init?: ConstructorParameters<typeof FireworksLLM>[0],
) => new FireworksLLM(init);
