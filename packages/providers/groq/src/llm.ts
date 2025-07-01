import { getEnv } from "@llamaindex/env";
import { OpenAI } from "@llamaindex/openai";
import GroqSDK, { type ClientOptions } from "groq-sdk";

// Models that support tool/function calling
const TOOL_CALLING_MODELS = [
  "gemma2-9b-it",
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "deepseek-r1-distill-llama-70b",
  "qwen-qwq-32b",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "meta-llama/llama-4-maverick-17b-128e-instruct"
] as const;

/**
 * Check if a Groq instance supports tool/function calling
 * @param groqInstance - The Groq instance to check
 * @returns true if the model supports tool calling, false otherwise
 */
function isFunctionCallingModel(groqInstance: Groq): boolean {
  return TOOL_CALLING_MODELS.includes(groqInstance.model as any);
}

export class Groq extends OpenAI {
  constructor(
    init?: Omit<Partial<OpenAI>, "session"> & {
      additionalSessionOptions?: ClientOptions;
    },
  ) {
    const {
      apiKey = getEnv("GROQ_API_KEY"),
      additionalSessionOptions = {},
      model = "llama-3.3-70b-versatile",
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

  get supportToolCall() {
    return isFunctionCallingModel(this);
  }
}

/**
 * Convenience function to create a new Groq instance.
 * @param init - Optional initialization parameters for the Groq instance.
 * @returns A new Groq instance.
 */
export const groq = (init?: ConstructorParameters<typeof Groq>[0]) =>
  new Groq(init);
