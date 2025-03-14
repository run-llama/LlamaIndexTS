import { getEnv } from "@llamaindex/env";
import { Tokenizers } from "@llamaindex/env/tokenizers";
import { OpenAI } from "@llamaindex/openai";

export const PERPLEXITY_MODELS = {
  "sonar-deep-research": {
    contextWindow: 128000,
  },
  "sonar-reasoning-pro": {
    contextWindow: 128000,
  },
  "sonar-reasoning": {
    contextWindow: 128000,
  },
  "sonar-pro": {
    contextWindow: 200000,
  },
  sonar: {
    contextWindow: 128000,
  },
  "r1-1776": {
    contextWindow: 128000,
  },
};

type PerplexityModelName = keyof typeof PERPLEXITY_MODELS;
const DEFAULT_MODEL: PerplexityModelName = "sonar";

export class Perplexity extends OpenAI {
  constructor(
    init?: Omit<Partial<OpenAI>, "session"> & { model?: PerplexityModelName },
  ) {
    const {
      apiKey = getEnv("PERPLEXITY_API_KEY"),
      additionalSessionOptions = {},
      model = DEFAULT_MODEL,
      ...rest
    } = init ?? {};

    if (!apiKey) {
      throw new Error("Perplexity API key is required");
    }

    additionalSessionOptions.baseURL =
      additionalSessionOptions.baseURL ?? "https://api.perplexity.ai/";

    super({
      apiKey,
      additionalSessionOptions,
      model,
      ...rest,
    });
  }

  get supportToolCall() {
    return false;
  }

  get metadata() {
    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP,
      contextWindow:
        PERPLEXITY_MODELS[this.model as PerplexityModelName]?.contextWindow,
      tokenizer: Tokenizers.CL100K_BASE,
      structuredOutput: false,
    };
  }
}

/**
 * Convenience function to create a new Perplexity instance.
 * @param init - Optional initialization parameters for the Perplexity instance.
 * @returns A new Perplexity instance.
 */
export const perplexity = (
  init?: ConstructorParameters<typeof Perplexity>[0],
) => new Perplexity(init);
