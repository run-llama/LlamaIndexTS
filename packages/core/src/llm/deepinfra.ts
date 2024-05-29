import { getEnv } from "@llamaindex/env";
import { OpenAI } from "./openai.js";

const ENV_VARIBLE_NAME = "DEEPINFRA_API_TOKEN";
const DEFAULT_MODEL = "mistralai/Mixtral-8x22B-Instruct-v0.1";

export class DeepInfra extends OpenAI {
  constructor(init?: Partial<OpenAI>) {
    const {
      apiKey = getEnv(ENV_VARIBLE_NAME),
      additionalSessionOptions = {},
      model = DEFAULT_MODEL,
      ...rest
    } = init ?? {};

    if (!apiKey) {
      throw new Error(
        `Set DeepInfra API key in ${ENV_VARIBLE_NAME} env variable`,
      );
    }

    additionalSessionOptions.baseURL =
      additionalSessionOptions.baseURL ?? "https://api.deepinfra.com/v1/openai";

    super({
      apiKey,
      additionalSessionOptions,
      model,
      ...rest,
    });
  }
}
