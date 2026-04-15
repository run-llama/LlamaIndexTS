import { getEnv } from "@llamaindex/env";
import { OpenAI } from "@llamaindex/openai";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "openai/gpt-4o";

export type OpenRouterProviderRouting = {
  /** Ordered list of provider slugs to try (e.g., ["anthropic", "openai"]) */
  order?: string[];
  /** Whether to allow fallback to other providers (default: true) */
  allow_fallbacks?: boolean;
  /** Only use providers that support all request parameters */
  require_parameters?: boolean;
  /** Control whether to use providers that may store data */
  data_collection?: "allow" | "deny";
  /** List of provider slugs to allow for this request */
  only?: string[];
  /** List of provider slugs to skip for this request */
  ignore?: string[];
  /** List of quantization levels to filter by (e.g., ["int4", "int8"]) */
  quantizations?: string[];
};

export type OpenRouterAdditionalOptions = {
  /** Your site URL for OpenRouter leaderboard attribution */
  siteUrl?: string;
  /** Your app name for OpenRouter attribution */
  appName?: string;
  /** Provider routing preferences */
  provider?: OpenRouterProviderRouting;
};

export class OpenRouterLLM extends OpenAI {
  constructor(
    init?: Omit<Partial<OpenAI>, "session"> & OpenRouterAdditionalOptions,
  ) {
    const {
      apiKey = getEnv("OPENROUTER_API_KEY"),
      additionalSessionOptions = {},
      model = DEFAULT_MODEL,
      siteUrl,
      appName,
      provider,
      ...rest
    } = init ?? {};

    if (!apiKey) {
      throw new Error(
        "Set OpenRouter API Key in OPENROUTER_API_KEY env variable",
      );
    }

    additionalSessionOptions.baseURL =
      additionalSessionOptions.baseURL ?? OPENROUTER_BASE_URL;

    // Set OpenRouter-specific attribution headers
    const defaultHeaders: Record<string, string> = {
      ...((additionalSessionOptions.defaultHeaders as Record<string, string>) ??
        {}),
    };
    if (siteUrl) defaultHeaders["HTTP-Referer"] = siteUrl;
    if (appName) defaultHeaders["X-OpenRouter-Title"] = appName;

    if (Object.keys(defaultHeaders).length > 0) {
      additionalSessionOptions.defaultHeaders = defaultHeaders;
    }

    super({
      apiKey,
      additionalSessionOptions,
      model,
      ...rest,
    });

    // Inject provider routing into chat options via extra_body
    if (provider) {
      this.additionalChatOptions = {
        ...this.additionalChatOptions,
        provider,
      } as typeof this.additionalChatOptions;
    }
  }

  get supportToolCall() {
    return true;
  }
}

/**
 * Convenience function to create a new OpenRouterLLM instance.
 * @param init - Optional initialization parameters for the OpenRouterLLM instance.
 * @returns A new OpenRouterLLM instance.
 */
export const openrouter = (
  init?: ConstructorParameters<typeof OpenRouterLLM>[0],
) => new OpenRouterLLM(init);
