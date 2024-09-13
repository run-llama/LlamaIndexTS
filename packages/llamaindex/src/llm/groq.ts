import { getEnv } from "@llamaindex/env";
import { OpenAI } from "@llamaindex/openai";
import GroqSDK, { type ClientOptions } from "groq-sdk";

export class Groq extends OpenAI {
  constructor(
    init?: Partial<OpenAI> & {
      additionalSessionOptions?: ClientOptions;
    },
  ) {
    const {
      apiKey = getEnv("GROQ_API_KEY"),
      additionalSessionOptions = {},
      model = "mixtral-8x7b-32768",
      ...rest
    } = init ?? {};

    super({
      apiKey,
      additionalSessionOptions,
      model,
      ...rest,
    });

    this.session.openai = new GroqSDK({
      apiKey,
      ...init?.additionalSessionOptions,
    }) as any;
  }
}
