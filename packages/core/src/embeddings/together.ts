import { OpenAIEmbedding } from "./OpenAIEmbedding.js";

export class TogetherEmbedding extends OpenAIEmbedding {
  constructor(init?: Partial<OpenAIEmbedding>) {
    const {
      apiKey = process.env.TOGETHER_API_KEY,
      additionalSessionOptions = {},
      model = "togethercomputer/m2-bert-80M-32k-retrieval",
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
