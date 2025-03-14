/**
 * vLLM
 *
 * https://docs.vllm.ai/en/latest/index.html
 *
 * @module
 */
import { OpenAI } from "@llamaindex/openai";

export type VLLMParams = {
  model: string;
  baseURL?: string;
};

export class VLLM extends OpenAI {
  constructor(params: VLLMParams) {
    super({
      additionalSessionOptions: {
        baseURL: "http://localhost:8000/v1",
      },
      model: params.model,
      apiKey: "token-abc123",
    });
  }
}

/**
 * Convenience function to create a new VLLM instance.
 * @param init - initialization parameters for the VLLM instance.
 * @returns A new VLLM instance.
 */
export const vllm = (init: ConstructorParameters<typeof VLLM>[0]) =>
  new VLLM(init);
