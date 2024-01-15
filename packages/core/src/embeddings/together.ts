import { OpenAIEmbeddingLike } from "./OpenAIEmbedding";

export class TogetherEmbedding extends OpenAIEmbeddingLike {
  override model: string;
  constructor(init?: Partial<TogetherEmbedding>) {
    super({
      apiKey: process.env.TOGETHER_API_KEY,
      ...init,
      additionalSessionOptions: {
        ...init?.additionalSessionOptions,
        baseURL: "https://api.together.xyz/v1",
      },
    });
    this.model = init?.model ?? "togethercomputer/m2-bert-80M-32k-retrieval";
  }
}
