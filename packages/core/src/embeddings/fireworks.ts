import { OpenAIEmbedding } from "./OpenAIEmbedding";

export class FireworksEmbedding extends OpenAIEmbedding {
  constructor(init?: Partial<OpenAIEmbedding>) {
    const {
      apiKey = process.env.FIREWORKS_API_KEY,
      additionalSessionOptions = {},
      model = "nomic-ai/nomic-embed-text-v1.5",
      ...rest
    } = init ?? {};

    if (!apiKey) {
      throw new Error("Set Fireworks Key in FIREWORKS_API_KEY env variable");
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
