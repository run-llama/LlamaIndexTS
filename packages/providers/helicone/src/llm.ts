import { getEnv } from "@llamaindex/env";
import { OpenAI } from "@llamaindex/openai";

const DEFAULT_API_BASE = "https://ai-gateway.helicone.ai/v1";
const DEFAULT_MODEL = "gpt-4o-mini";

export class Helicone extends OpenAI {
  constructor(init?: Omit<Partial<OpenAI>, "session">) {
    const {
      apiKey = getEnv("HELICONE_API_KEY"),
      additionalSessionOptions = {},
      model = DEFAULT_MODEL,
      ...rest
    } = init ?? {};

    if (!apiKey) {
      throw new Error("Set Helicone API key in HELICONE_API_KEY env variable");
    }

    // Allow override via HELICONE_API_BASE or provided additionalSessionOptions.baseURL
    const envBase = getEnv("HELICONE_API_BASE");
    additionalSessionOptions.baseURL =
      additionalSessionOptions.baseURL ?? envBase ?? DEFAULT_API_BASE;

    super({
      apiKey,
      additionalSessionOptions,
      model,
      ...rest,
    });
  }
}

/**
 * Convenience function to create a new HeliconeLLM instance.
 * @param init - Optional initialization parameters for the HeliconeLLM instance.
 * @returns A new HeliconeLLM instance.
 */
export const helicone = (init?: ConstructorParameters<typeof Helicone>[0]) =>
  new Helicone(init);
