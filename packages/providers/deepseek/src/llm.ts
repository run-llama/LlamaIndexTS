import { getEnv } from "@llamaindex/env";
import { OpenAI } from "@llamaindex/openai";

export const DEEPSEEK_MODELS = {
  "deepseek-coder": { contextWindow: 128000 },
  "deepseek-chat": { contextWindow: 128000 },
};

type DeepSeekModelName = keyof typeof DEEPSEEK_MODELS;
const DEFAULT_MODEL: DeepSeekModelName = "deepseek-coder";

export class DeepSeekLLM extends OpenAI {
  constructor(
    init?: Omit<Partial<OpenAI>, "session"> & { model?: DeepSeekModelName },
  ) {
    const {
      apiKey = getEnv("DEEPSEEK_API_KEY"),
      additionalSessionOptions = {},
      model = DEFAULT_MODEL,
      ...rest
    } = init ?? {};

    if (!apiKey) {
      throw new Error("Set DeepSeek Key in DEEPSEEK_API_KEY env variable");
    }

    additionalSessionOptions.baseURL =
      additionalSessionOptions.baseURL ?? "https://api.deepseek.com/v1";

    super({
      apiKey,
      additionalSessionOptions,
      model,
      ...rest,
    });
  }
}

/**
 * Convenience function to create a new DeepSeekLLM instance.
 * @param init - Optional initialization parameters for the DeepSeekLLM instance.
 * @returns A new DeepSeekLLM instance.
 */
export const deepseek = (init?: ConstructorParameters<typeof DeepSeekLLM>[0]) =>
  new DeepSeekLLM(init);
