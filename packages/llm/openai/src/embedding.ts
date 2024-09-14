import { BaseEmbedding } from "@llamaindex/core/embeddings";
import { Tokenizers } from "@llamaindex/env";
import type { ClientOptions as OpenAIClientOptions } from "openai";
import type { AzureOpenAIConfig } from "./azure.js";
import {
  getAzureConfigFromEnv,
  getAzureModel,
  shouldUseAzure,
} from "./azure.js";
import type { OpenAISession } from "./llm.js";
import { getOpenAISession } from "./llm.js";

export const ALL_OPENAI_EMBEDDING_MODELS = {
  "text-embedding-ada-002": {
    dimensions: 1536,
    maxTokens: 8192,
    tokenizer: Tokenizers.CL100K_BASE,
  },
  "text-embedding-3-small": {
    dimensions: 1536,
    dimensionOptions: [512, 1536],
    maxTokens: 8192,
    tokenizer: Tokenizers.CL100K_BASE,
  },
  "text-embedding-3-large": {
    dimensions: 3072,
    dimensionOptions: [256, 1024, 3072],
    maxTokens: 8192,
    tokenizer: Tokenizers.CL100K_BASE,
  },
};

type ModelKeys = keyof typeof ALL_OPENAI_EMBEDDING_MODELS;

export class OpenAIEmbedding extends BaseEmbedding {
  /** embeddding model. defaults to "text-embedding-ada-002" */
  model: string;
  /** number of dimensions of the resulting vector, for models that support choosing fewer dimensions. undefined will default to model default */
  dimensions?: number | undefined;

  // OpenAI session params

  /** api key */
  apiKey?: string | undefined = undefined;
  /** maximum number of retries, default 10 */
  maxRetries: number;
  /** timeout in ms, default 60 seconds  */
  timeout?: number | undefined;
  /** other session options for OpenAI */
  additionalSessionOptions?:
    | Omit<Partial<OpenAIClientOptions>, "apiKey" | "maxRetries" | "timeout">
    | undefined;

  /** session object */
  session: OpenAISession;

  /**
   * OpenAI Embedding
   * @param init - initial parameters
   */
  constructor(init?: Partial<OpenAIEmbedding> & { azure?: AzureOpenAIConfig }) {
    super();

    this.model = init?.model ?? "text-embedding-ada-002";
    this.dimensions = init?.dimensions; // if no dimensions provided, will be undefined/not sent to OpenAI

    this.embedBatchSize = init?.embedBatchSize ?? 10;
    this.maxRetries = init?.maxRetries ?? 10;

    this.timeout = init?.timeout ?? 60 * 1000; // Default is 60 seconds
    this.additionalSessionOptions = init?.additionalSessionOptions;

    // find metadata for model
    const key = Object.keys(ALL_OPENAI_EMBEDDING_MODELS).find(
      (key) => key === this.model,
    ) as ModelKeys | undefined;
    if (key) {
      this.embedInfo = ALL_OPENAI_EMBEDDING_MODELS[key];
    }

    if (init?.azure || shouldUseAzure()) {
      const azureConfig = {
        ...getAzureConfigFromEnv({
          model: getAzureModel(this.model),
        }),
        ...init?.azure,
      };

      this.apiKey = azureConfig.apiKey;
      this.session =
        init?.session ??
        getOpenAISession({
          azure: true,
          maxRetries: this.maxRetries,
          timeout: this.timeout,
          ...this.additionalSessionOptions,
          ...azureConfig,
        });
    } else {
      this.apiKey = init?.apiKey ?? undefined;
      this.session =
        init?.session ??
        getOpenAISession({
          apiKey: this.apiKey,
          maxRetries: this.maxRetries,
          timeout: this.timeout,
          ...this.additionalSessionOptions,
        });
    }
  }

  /**
   * Get embeddings for a batch of texts
   * @param texts
   * @param options
   */
  private async getOpenAIEmbedding(input: string[]): Promise<number[][]> {
    // TODO: ensure this for every sub class by calling it in the base class
    input = this.truncateMaxTokens(input);

    const { data } = await this.session.openai.embeddings.create(
      this.dimensions
        ? {
            model: this.model,
            dimensions: this.dimensions, // only sent to OpenAI if set by user
            input,
          }
        : {
            model: this.model,
            input,
          },
    );

    return data.map((d) => d.embedding);
  }

  /**
   * Get embeddings for a batch of texts
   * @param texts
   */
  getTextEmbeddings = async (texts: string[]): Promise<number[][]> => {
    return this.getOpenAIEmbedding(texts);
  };

  /**
   * Get embeddings for a single text
   * @param text
   */
  async getTextEmbedding(text: string): Promise<number[]> {
    return (await this.getOpenAIEmbedding([text]))[0]!;
  }
}
