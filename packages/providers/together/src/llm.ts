import { getEnv } from "@llamaindex/env";
import { OpenAI } from "@llamaindex/openai";

export class TogetherLLM extends OpenAI {
  constructor(init?: Omit<Partial<OpenAI>, "session">) {
    const {
      apiKey = getEnv("TOGETHER_API_KEY"),
      additionalSessionOptions = {},
      model = "togethercomputer/llama-2-7b-chat",
      ...rest
    } = init ?? {};

    if (!apiKey) {
      throw new Error("Set Together Key in TOGETHER_API_KEY env variable"); // Tell user to set correct env variable, and not OPENAI_API_KEY
    }

    additionalSessionOptions.baseURL =
      additionalSessionOptions.baseURL ?? "https://api.together.xyz/v1";

    super({
      apiKey,
      additionalSessionOptions,
      model,
      ...rest,
    });
  }
}

/**
 * Convenience function to create a new TogetherLLM instance.
 * @param init - Optional initialization parameters for the TogetherLLM instance.
 * @returns A new TogetherLLM instance.
 */
export const together = (init?: ConstructorParameters<typeof TogetherLLM>[0]) =>
  new TogetherLLM(init);
