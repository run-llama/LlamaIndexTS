import { getEnv } from "@llamaindex/env";
import { OpenAI } from "./openai.js";

const DEEPSEEK_MODELS = {
  "deepseek-coder": { contextWindow: 128000 },
  "deepseek-chat": { contextWindow: 128000 },
};

export { DEEPSEEK_MODELS };

type DeepSeekModelName = keyof typeof DEEPSEEK_MODELS;
const DEFAULT_MODEL: DeepSeekModelName = "deepseek-coder";

export class DeepSeekLLM extends OpenAI {
  constructor(init?: Partial<OpenAI> & { model?: DeepSeekModelName }) {
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
