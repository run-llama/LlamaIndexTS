import { getEnv } from "@llamaindex/env";
import { OpenAI } from "@llamaindex/openai";
import GroqSDK, { type ClientOptions } from "groq-sdk";

export class Groq extends OpenAI {
  constructor(
    init?: Omit<Partial<OpenAI>, "session"> & {
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

    this.lazySession = async () =>
      new GroqSDK({
        apiKey,
        ...init?.additionalSessionOptions,
      }) as never;
  }
}

/**
 * Convenience function to create a new Groq instance.
 * @param init - Optional initialization parameters for the Groq instance.
 * @returns A new Groq instance.
 */
export const groq = (init?: ConstructorParameters<typeof Groq>[0]) =>
  new Groq(init);
