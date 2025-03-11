import { getEnv } from "@llamaindex/env";
import { OpenAI } from "@llamaindex/openai";

const ENV_VARIABLE_NAME = "DEEPINFRA_API_TOKEN";
const DEFAULT_MODEL = "mistralai/Mixtral-8x22B-Instruct-v0.1";
const BASE_URL = "https://api.deepinfra.com/v1/openai";

export class DeepInfra extends OpenAI {
  constructor(init?: Omit<Partial<OpenAI>, "session">) {
    const {
      apiKey = getEnv(ENV_VARIABLE_NAME),
      additionalSessionOptions = {},
      model = DEFAULT_MODEL,
      ...rest
    } = init ?? {};

    if (!apiKey) {
      throw new Error(
        `Set DeepInfra API key in ${ENV_VARIABLE_NAME} env variable`,
      );
    }

    additionalSessionOptions.baseURL =
      additionalSessionOptions.baseURL ?? BASE_URL;

    super({
      apiKey,
      additionalSessionOptions,
      model,
      ...rest,
    });
  }
}

/**
 * Convenience function to create a new DeepInfra instance.
 * @param init - Optional initialization parameters for the DeepInfra instance.
 * @returns A new DeepInfra instance.
 */
export const deepinfra = (init?: ConstructorParameters<typeof DeepInfra>[0]) =>
  new DeepInfra(init);
