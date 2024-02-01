import { ClientOptions as OpenAIClientOptions } from "openai";
import {
  AzureOpenAIConfig,
  getAzureBaseUrl,
  getAzureConfigFromEnv,
  getAzureModel,
  shouldUseAzure,
} from "../llm/azure";
import { OpenAISession, getOpenAISession } from "../llm/open_ai";
import { BaseEmbedding } from "./types";

export const ALL_OPENAI_EMBEDDING_MODELS = {
  "text-embedding-ada-002": {
    dimensions: 1536,
    maxTokens: 8191,
  },
  "text-embedding-3-small": {
    dimensions: 1536,
    dimensionOptions: [512, 1536],
    maxTokens: 8191,
  },
  "text-embedding-3-large": {
    dimensions: 3072,
    dimensionOptions: [256, 1024, 3072],
    maxTokens: 8191,
  },
};

export class OpenAIEmbedding extends BaseEmbedding {
  /** embeddding model. defaults to "text-embedding-ada-002" */
  model: string;
  /** number of dimensions of the resulting vector, for models that support choosing fewer dimensions. undefined will default to model default */
  dimensions: number | undefined;

  // OpenAI session params

  /** api key */
  apiKey?: string = undefined;
  /** maximum number of retries, default 10 */
  maxRetries: number;
  /** timeout in ms, default 60 seconds  */
  timeout?: number;
  /** other session options for OpenAI */
  additionalSessionOptions?: Omit<
    Partial<OpenAIClientOptions>,
    "apiKey" | "maxRetries" | "timeout"
  >;

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

    this.maxRetries = init?.maxRetries ?? 10;
    this.timeout = init?.timeout ?? 60 * 1000; // Default is 60 seconds
    this.additionalSessionOptions = init?.additionalSessionOptions;

    if (init?.azure || shouldUseAzure()) {
      const azureConfig = getAzureConfigFromEnv({
        ...init?.azure,
        model: getAzureModel(this.model),
      });

      if (!azureConfig.apiKey) {
        throw new Error(
          "Azure API key is required for OpenAI Azure models. Please set the AZURE_OPENAI_KEY environment variable.",
        );
      }

      this.apiKey = azureConfig.apiKey;
      this.session =
        init?.session ??
        getOpenAISession({
          azure: true,
          apiKey: this.apiKey,
          baseURL: getAzureBaseUrl(azureConfig),
          maxRetries: this.maxRetries,
          timeout: this.timeout,
          defaultQuery: { "api-version": azureConfig.apiVersion },
          ...this.additionalSessionOptions,
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

  private async getOpenAIEmbedding(input: string) {
    const { data } = await this.session.openai.embeddings.create({
      model: this.model,
      dimensions: this.dimensions, // only sent to OpenAI if set by user
      input,
    });

    return data[0].embedding;
  }

  async getTextEmbedding(text: string): Promise<number[]> {
    return this.getOpenAIEmbedding(text);
  }

  async getQueryEmbedding(query: string): Promise<number[]> {
    return this.getOpenAIEmbedding(query);
  }
}
