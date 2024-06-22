import { getEnv } from "@llamaindex/env";
import { MixedbreadAI, MixedbreadAIClient } from "@mixedbread-ai/sdk";
import { BaseEmbedding, type EmbeddingInfo } from "./types.js";

type EmbeddingsRequestWithoutInput = Omit<
  MixedbreadAI.EmbeddingsRequest,
  "input"
>;

/**
 * Interface extending EmbeddingsParams with additional
 * parameters specific to the MixedbreadAIEmbeddings class.
 */
export interface MixedbreadAIEmbeddingsParams
  extends Omit<EmbeddingsRequestWithoutInput, "model"> {
  /**
   * The model to use for generating embeddings.
   * @default {"mixedbread-ai/mxbai-embed-large-v1"}
   */
  model?: string;

  /**
   * The API key to use.
   * @default {process.env.MXBAI_API_KEY}
   */
  apiKey?: string;

  /**
   * The base URL for the API.
   */
  baseUrl?: string;

  /**
   * The maximum number of documents to embed in a single request.
   * @default {128}
   */
  embedBatchSize?: number;

  /**
   * The embed info for the model.
   */
  embedInfo?: EmbeddingInfo;

  /**
   * The maximum number of retries to attempt.
   * @default {3}
   */
  maxRetries?: number;

  /**
   * Timeouts for the request.
   */
  timeoutInSeconds?: number;
}

/**
 * Class for generating embeddings using the mixedbread ai API.
 *
 * This class leverages the model "mixedbread-ai/mxbai-embed-large-v1" to generate
 * embeddings for text documents. The embeddings can be used for various NLP tasks
 * such as similarity comparison, clustering, or as features in machine learning models.
 *
 * @example
 * const mxbai = new MixedbreadAIEmbeddings({ apiKey: 'your-api-key' });
 * const texts = ["Baking bread is fun", "I love baking"];
 * const result = await mxbai.getTextEmbeddings(texts);
 * console.log(result);
 *
 * @example
 * const mxbai = new MixedbreadAIEmbeddings({
 *  apiKey: 'your-api-key',
 *  model: 'mixedbread-ai/mxbai-embed-large-v1',
 *  encodingFormat: MixedbreadAI.EncodingFormat.Binary,
 *  dimensions: 512,
 *  normalized: true,
 * });
 * const query = "Represent this sentence for searching relevant passages: Is baking bread fun?";
 * const result = await mxbai.getTextEmbedding(query);
 * console.log(result);
 */
export class MixedbreadAIEmbeddings extends BaseEmbedding {
  requestParams: EmbeddingsRequestWithoutInput;
  requestOptions: MixedbreadAIClient.RequestOptions;
  private client: MixedbreadAIClient;

  /**
   * Constructor for MixedbreadAIEmbeddings.
   * @param {Partial<MixedbreadAIEmbeddingsParams>} params - An optional object with properties to configure the instance.
   * @throws {Error} If the API key is not provided or found in the environment variables.
   * @throws {Error} If the batch size exceeds 256.
   */
  constructor(params?: Partial<MixedbreadAIEmbeddingsParams>) {
    super();

    const apiKey = params?.apiKey ?? getEnv("MXBAI_API_KEY");
    if (!apiKey) {
      throw new Error(
        "mixedbread ai API key not found. Either provide it in the constructor or set the 'MXBAI_API_KEY' environment variable.",
      );
    }
    if (params?.embedBatchSize && params?.embedBatchSize > 256) {
      throw new Error(
        "The maximum batch size for mixedbread ai embeddings API is 256.",
      );
    }

    this.embedBatchSize = params?.embedBatchSize ?? 128;
    this.embedInfo = params?.embedInfo;
    this.requestParams = {
      model: params?.model ?? "mixedbread-ai/mxbai-embed-large-v1",
      normalized: params?.normalized,
      dimensions: params?.dimensions,
      encodingFormat: params?.encodingFormat,
      truncationStrategy: params?.truncationStrategy,
      prompt: params?.prompt,
    };
    this.requestOptions = {
      timeoutInSeconds: params?.timeoutInSeconds,
      maxRetries: params?.maxRetries ?? 3,
    };
    this.client = new MixedbreadAIClient({
      apiKey,
      environment: params?.baseUrl,
    });
  }

  /**
   * Generates an embedding for a single text.
   * @param {string} text - A string to generate an embedding for.
   * @returns {Promise<number[]>} A Promise that resolves to an array of numbers representing the embedding.
   *
   * @example
   * const query = "Represent this sentence for searching relevant passages: Is baking bread fun?";
   * const result = await mxbai.getTextEmbedding(text);
   * console.log(result);
   */
  async getTextEmbedding(text: string): Promise<number[]> {
    return (await this.getTextEmbeddings([text]))[0];
  }

  /**
   * Generates embeddings for an array of texts.
   * @param {string[]} texts - An array of strings to generate embeddings for.
   * @returns {Promise<Array<number[]>>} A Promise that resolves to an array of embeddings.
   *
   * @example
   * const texts = ["Baking bread is fun", "I love baking"];
   * const result = await mxbai.getTextEmbeddings(texts);
   * console.log(result);
   */
  async getTextEmbeddings(texts: string[]): Promise<Array<number[]>> {
    if (texts.length === 0) {
      return [];
    }

    const response = await this.client.embeddings(
      {
        ...this.requestParams,
        input: texts,
      },
      this.requestOptions,
    );
    return response.data.map((d) => d.embedding as number[]);
  }
}
