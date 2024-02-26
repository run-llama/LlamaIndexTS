import { OpenAI } from "./LLM.js";

export class TogetherLLM extends OpenAI {
  constructor(init?: Partial<OpenAI>) {
    const {
      apiKey = process.env.TOGETHER_API_KEY,
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
