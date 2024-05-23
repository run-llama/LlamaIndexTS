import { getEnv } from "@llamaindex/env";
import { BaseEmbedding } from "./types.js";

const DEFAULT_MODEL = "sentence-transformers/clip-ViT-B-32";

const API_TOKEN_ENV_VARIABLE_NAME = "DEEPINFRA_API_TOKEN";

const API_ROOT = "https://api.deepinfra.com/v1/inference";

export interface DeepInfraEmbeddingResponse {
  embeddings: number[][];
  input_tokens: number;
  request_id: string;
  inference_status: InferenceStatus;
}

export interface InferenceStatus {
  status: string;
  runtime_ms: number;
  cost: number;
  tokens_generated: number;
  tokens_input: number;
}

const mapPrefixWithInputs = (prefix: string, inputs: string[]): string[] => {
  return inputs.map((input) => `${prefix} ${input}`);
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

  constructor(init?: Partial<DeepInfraEmbedding>) {
    super();

    this.model = init?.model ?? DEFAULT_MODEL;
    this.apiToken = init?.apiToken ?? getEnv(API_TOKEN_ENV_VARIABLE_NAME) ?? "";
    this.queryPrefix = init?.queryPrefix ?? "";
    this.textPrefix = init?.textPrefix ?? "";
  }

  async getTextEmbedding(text: string): Promise<number[]> {
    const texts = mapPrefixWithInputs(this.textPrefix, [text]);
    const embeddings = await this.getDeepInfraEmbedding(texts);
    return embeddings[0];
  }

  async getQueryEmbedding(query: string): Promise<number[]> {
    const queries = mapPrefixWithInputs(this.queryPrefix, [query]);
    const embeddings = await this.getDeepInfraEmbedding(queries);
    return embeddings[0];
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
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiToken}`,
      },
      body: JSON.stringify({
        inputs: [inputs],
      }),
    });
    const responseJson: DeepInfraEmbeddingResponse = await response.json();
    return responseJson.embeddings;
  }

  private getUrl(model: string): string {
    return `${API_ROOT}/${model}`;
  }
}
