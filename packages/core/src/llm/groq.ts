import { getEnv } from "@llamaindex/env";
import { OpenAI } from "./openai.js";

export class Groq extends OpenAI {
  constructor(init?: Partial<OpenAI>) {
    const {
      apiKey = getEnv("GROQ_API_KEY"),
      additionalSessionOptions = {},
      model = "mixtral-8x7b-32768",
      ...rest
    } = init ?? {};

    if (!apiKey) {
      throw new Error("Set Groq Key in GROQ_API_KEY env variable"); // Tell user to set correct env variable, and not OPENAI_API_KEY
    }

    additionalSessionOptions.baseURL =
      additionalSessionOptions.baseURL ?? "https://api.groq.com/openai/v1";

    super({
      apiKey,
      additionalSessionOptions,
      model,
      ...rest,
    });
  }
}
