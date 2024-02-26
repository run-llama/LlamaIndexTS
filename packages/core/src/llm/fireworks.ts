import { OpenAI } from "./LLM.js";

export class FireworksLLM extends OpenAI {
  constructor(init?: Partial<OpenAI>) {
    const {
      apiKey = process.env.FIREWORKS_API_KEY,
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
