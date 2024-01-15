import { Tokenizers } from "../GlobalsHelper";
import { OpenAILike } from "./LLM";

export class TogetherLLM extends OpenAILike {
  override model: string;
  constructor(
    init?: Partial<TogetherLLM> & {
      model?: string;
    },
  ) {
    super({
      ...init,
      apiKey: process.env.TOGETHER_API_KEY,
      additionalSessionOptions: {
        ...init?.additionalSessionOptions,
        baseURL: "https://api.together.xyz/v1",
      },
    });
    this.model = init?.model ?? '"mistralai/Mixtral-8x7B-Instruct-v0.1';
  }

  get metadata() {
    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP,
      maxTokens: this.maxTokens,
      // todo: cannot find context window in documentation
      contextWindow: 1024,
      tokenizer: Tokenizers.CL100K_BASE,
    };
  }
}
