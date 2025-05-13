import { getEnv } from "@llamaindex/env";
import { OpenAI } from "@llamaindex/openai";

export class XAILLM extends OpenAI {
  constructor(init?: Omit<Partial<OpenAI>, "session">) {
    const {
      apiKey = getEnv("XAI_API_KEY"),
      additionalSessionOptions = {},
      model = "grok-3-latest",
      ...rest
    } = init ?? {};

    if (!apiKey) {
      throw new Error("Set API Key in XAI_API_KEY environment variable");
    }

    additionalSessionOptions.baseURL =
      additionalSessionOptions.baseURL ?? "https://api.x.ai/v1";

    super({
      apiKey,
      additionalSessionOptions,
      model,
      ...rest,
    });
  }

  get supportToolCall() {
    return true;
  }
}

/**
 * Convenience function to create a new XAILLM instance.
 * @param init - Optional initialization parameters for the XAILLM instance.
 * @returns A new XAILLM instance.
 */
export const xai = (init?: ConstructorParameters<typeof XAILLM>[0]) =>
  new XAILLM(init);
