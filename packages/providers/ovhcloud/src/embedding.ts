import { getEnv } from "@llamaindex/env";
import { OpenAIEmbedding } from "@llamaindex/openai";
import { BASE_URL, ENV_VARIABLE_NAME } from "./utils";

export class OVHcloudEmbedding extends OpenAIEmbedding {
  constructor(init?: Omit<Partial<OpenAIEmbedding>, "session">) {
    const {
      apiKey = getEnv(ENV_VARIABLE_NAME) ?? "",
      additionalSessionOptions = {},
      model = "BGE-M3",
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
