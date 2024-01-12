import { OpenAI } from "./LLM";

export class TogetherLLM extends OpenAI {
  constructor(init?: Partial<OpenAI>) {
    super({
      ...init,
      apiKey: process.env.TOGETHER_API_KEY,
      additionalSessionOptions: {
        ...init?.additionalSessionOptions,
        baseURL: "https://api.together.xyz/v1",
      },
    });
  }
}
