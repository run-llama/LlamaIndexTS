import { BaseEmbedding } from "@llamaindex/core/embeddings";
import type { MessageContentDetail } from "@llamaindex/core/llms";
import { extractSingleText } from "@llamaindex/core/utils";
import { getEnv } from "@llamaindex/env";
import { VoyageAI, VoyageAIClient } from "voyageai";

const DEFAULT_MODEL = "voyage-3";
const API_TOKEN_ENV_VARIABLE_NAME = "VOYAGE_API_TOKEN";
// const API_ROOT = "https://api.voyageai.com/v1/embeddings";
const DEFAULT_TIMEOUT = 60 * 1000;
const DEFAULT_MAX_RETRIES = 5;

/**
 * VoyageAIEmbedding is an alias for VoyageAI that implements the BaseEmbedding interface.
 */
export class VoyageAIEmbedding extends BaseEmbedding {
  /**
   * VoyageAI model to use
   * @default "voyage-3"
   * @see https://docs.voyageai.com/docs/embeddings
   */
  model: string;

  /**
   * VoyageAI API token
   * @see https://docs.voyageai.com/docs/api-key-and-installation
   * If not provided, it will try to get the token from the environment variable `VOYAGE_API_KEY`
   *
   */
  apiKey: string;

  /**
   * Maximum number of retries
   * @default 5
   */
  maxRetries: number;

  /**
   * Timeout in seconds
   * @default 60
   */
  timeout: number;
  /**
   * Whether to truncate the input texts to fit within the context length. Defaults to `true`.
   * If `true`, over-length input texts will be truncated to fit within the context length, before vectorized by the embedding model.
   * If `false`, an error will be raised if any given text exceeds the context length.
   */
  truncation: boolean;

  /**
   * VoyageAI supports `document` and `query` as input types, or it can be left undefined. Using an input type prepends the input with a prompt before embedding.
   * Example from their docs: using "query" adds "Represent the query for retrieving supporting documents:"
   * VoyageAI says these types improve performance, but it will add to token usage. Embeddings with input types are compatible with those that don't use them.
   * Setting this to `query` will use the `query` input type for getQueryEmbedding(s).
   * Setting this to `document` will use the `document` input type for getTextEmbedding(s).
   * Setting this to `both` will do both of the above.
   * By default, this is undefined, which means no input types are used.
   * @see https://docs.voyageai.com/docs/embeddings
   * @default undefined
   */
  useInputTypes: "query" | "document" | "both" | undefined;

  /**
   * VoyageAI client
   */
  client: VoyageAIClient;

  constructor(init?: Partial<VoyageAIEmbedding>) {
    super();

    this.model = init?.model ?? DEFAULT_MODEL;
    this.apiKey = init?.apiKey ?? getEnv(API_TOKEN_ENV_VARIABLE_NAME) ?? "";
    this.maxRetries = init?.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.timeout = init?.timeout ?? DEFAULT_TIMEOUT;
    this.truncation = init?.truncation ?? true;
    this.useInputTypes = init?.useInputTypes;
    this.client = new VoyageAIClient({
      apiKey: this.apiKey,
    });
  }

  async getTextEmbedding(text: string): Promise<number[]> {
    const embeddings = await this.getVoyageAIEmbedding([text], "document");
    return embeddings[0]!;
  }

  async getQueryEmbedding(
    query: MessageContentDetail,
  ): Promise<number[] | null> {
    const text = extractSingleText(query);
    if (text) {
      const embeddings = await this.getVoyageAIEmbedding([text], "query");
      return embeddings[0]!;
    } else {
      return null;
    }
  }

  getTextEmbeddings = async (texts: string[]): Promise<number[][]> => {
    return this.getVoyageAIEmbedding(texts, "document");
  };

  async getQueryEmbeddings(queries: string[]): Promise<number[][]> {
    return this.getVoyageAIEmbedding(queries, "query");
  }

  private getInputType(requestType: "query" | "document") {
    if (this.useInputTypes === "both") {
      return requestType;
    } else if (this.useInputTypes === requestType) {
      return requestType;
    } else {
      return undefined;
    }
  }

  private async getVoyageAIEmbedding(
    inputs: VoyageAI.EmbedRequestInput,
    inputType: VoyageAI.EmbedRequestInputType,
  ): Promise<number[][]> {
    const request: VoyageAI.EmbedRequest = {
      model: this.model,
      input: inputs,
      truncation: this.truncation,
    };
    const preferredInputType = this.getInputType(inputType);
    if (preferredInputType) {
      request.inputType = preferredInputType;
    }
    const response = await this.client.embed(request);
    if (response.data) {
      return response.data.map((item) => item.embedding ?? []);
    } else {
      throw new Error("Failed to get embeddings from VoyageAI");
    }
  }
}
