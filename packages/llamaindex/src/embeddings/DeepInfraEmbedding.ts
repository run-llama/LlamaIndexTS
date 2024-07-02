import type { MessageContentDetail } from "@llamaindex/core/llms";
import { getEnv } from "@llamaindex/env";
import { extractSingleText } from "../llm/utils.js";
import { BaseEmbedding } from "./types.js";

const DEFAULT_MODEL = "sentence-transformers/clip-ViT-B-32";

const API_TOKEN_ENV_VARIABLE_NAME = "DEEPINFRA_API_TOKEN";

const API_ROOT = "https://api.deepinfra.com/v1/inference";

const DEFAULT_TIMEOUT = 60 * 1000;

const DEFAULT_MAX_RETRIES = 5;

export interface DeepInfraEmbeddingResponse {
  embeddings: number[][];
  request_id: string;
  inference_status: InferenceStatus;
}

export interface InferenceStatus {
  status: string;
  runtime_ms: number;
  cost: number;
  tokens_input: number;
}

const mapPrefixWithInputs = (prefix: string, inputs: string[]): string[] => {
  return inputs.map((input) => (prefix ? `${prefix} ${input}` : input));
};

/**
 * DeepInfraEmbedding is an alias for DeepInfra that implements the BaseEmbedding interface.
 */
export class DeepInfraEmbedding extends BaseEmbedding {
  /**
   * DeepInfra model to use
   * @default "sentence-transformers/clip-ViT-B-32"
   * @see https://deepinfra.com/models/embeddings
   */
  model: string;

  /**
   * DeepInfra API token
   * @see https://deepinfra.com/dash/api_keys
   * If not provided, it will try to get the token from the environment variable `DEEPINFRA_API_TOKEN`
   *
   */
  apiToken: string;

  /**
   * Prefix to add to the query
   * @default ""
   */
  queryPrefix: string;

  /**
   * Prefix to add to the text
   * @default ""
   */
  textPrefix: string;

  /**
   *
   * @default 5
   */
  maxRetries: number;

  /**
   *
   * @default 60 * 1000
   */
  timeout: number;

  constructor(init?: Partial<DeepInfraEmbedding>) {
    super();

    this.model = init?.model ?? DEFAULT_MODEL;
    this.apiToken = init?.apiToken ?? getEnv(API_TOKEN_ENV_VARIABLE_NAME) ?? "";
    this.queryPrefix = init?.queryPrefix ?? "";
    this.textPrefix = init?.textPrefix ?? "";
    this.maxRetries = init?.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.timeout = init?.timeout ?? DEFAULT_TIMEOUT;
  }

  async getTextEmbedding(text: string): Promise<number[]> {
    const texts = mapPrefixWithInputs(this.textPrefix, [text]);
    const embeddings = await this.getDeepInfraEmbedding(texts);
    return embeddings[0];
  }

  async getQueryEmbedding(
    query: MessageContentDetail,
  ): Promise<number[] | null> {
    const text = extractSingleText(query);
    if (text) {
      const queries = mapPrefixWithInputs(this.queryPrefix, [text]);
      const embeddings = await this.getDeepInfraEmbedding(queries);
      return embeddings[0];
    } else {
      return null;
    }
  }

  async getTextEmbeddings(texts: string[]): Promise<number[][]> {
    const textsWithPrefix = mapPrefixWithInputs(this.textPrefix, texts);
    return await this.getDeepInfraEmbedding(textsWithPrefix);
  }

  async getQueryEmbeddings(queries: string[]): Promise<number[][]> {
    const queriesWithPrefix = mapPrefixWithInputs(this.queryPrefix, queries);
    return await this.getDeepInfraEmbedding(queriesWithPrefix);
  }

  private async getDeepInfraEmbedding(inputs: string[]): Promise<number[][]> {
    const url = this.getUrl(this.model);

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiToken}`,
          },
          body: JSON.stringify({ inputs }),
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const responseJson: DeepInfraEmbeddingResponse = await response.json();
        return responseJson.embeddings;
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed: ${error}`);
      } finally {
        clearTimeout(id);
      }
    }

    throw new Error("Exceeded maximum retries");
  }

  private getUrl(model: string): string {
    return `${API_ROOT}/${model}`;
  }
}
