import { getEnv } from "@llamaindex/env";
import { Groq as GroqSDK, type ClientOptions } from "groq-sdk";
import { OpenAI } from "./openai.js";

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
