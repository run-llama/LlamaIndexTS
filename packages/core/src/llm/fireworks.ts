import { getEnv } from "@llamaindex/env";
import { OpenAI } from "./open_ai.js";

export class FireworksLLM extends OpenAI {
  constructor(init?: Partial<OpenAI>) {
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
