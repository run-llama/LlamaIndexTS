import { OpenAIEmbedding } from "./OpenAIEmbedding";

export class TogetherEmbedding extends OpenAIEmbedding {
  override model: string;
  constructor(init?: Partial<OpenAIEmbedding>) {
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
