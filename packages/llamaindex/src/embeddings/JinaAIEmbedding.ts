import { getEnv } from "@llamaindex/env";
import { OpenAIEmbedding } from "./OpenAIEmbedding.js";

export class JinaAIEmbedding extends OpenAIEmbedding {
  constructor(init?: Partial<OpenAIEmbedding>) {
    const {
      apiKey = getEnv("JINAAI_API_KEY"),
      additionalSessionOptions = {},
      model = "jina-embeddings-v2-base-en",
      ...rest
    } = init ?? {};

    if (!apiKey) {
      throw new Error(
        "Set Jina AI API Key in JINAAI_API_KEY env variable. Get one for free or top up your key at https://jina.ai/embeddings",
      );
    }

    additionalSessionOptions.baseURL =
      additionalSessionOptions.baseURL ?? "https://api.jina.ai/v1";

    super({
      apiKey,
      additionalSessionOptions,
      model,
      ...rest,
    });
  }
}
