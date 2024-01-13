import { ClientOptions as OpenAIClientOptions } from "openai";
import {
  AzureOpenAIConfig,
  getAzureBaseUrl,
  getAzureConfigFromEnv,
  getAzureModel,
  shouldUseAzure,
} from "../llm/azure";
import { OpenAISession, getOpenAISession } from "../llm/openai";
import { BaseEmbedding } from "./types";

export enum OpenAIEmbeddingModelType {
  TEXT_EMBED_ADA_002 = "text-embedding-ada-002",
}

export class OpenAIEmbedding extends BaseEmbedding {
  model: OpenAIEmbeddingModelType | string;

  // OpenAI session params
  apiKey?: string = undefined;
  maxRetries: number;
  timeout?: number;
  additionalSessionOptions?: Omit<
    Partial<OpenAIClientOptions>,
    "apiKey" | "maxRetries" | "timeout"
  >;

  session: OpenAISession;

  constructor(init?: Partial<OpenAIEmbedding> & { azure?: AzureOpenAIConfig }) {
    super();

    this.model = OpenAIEmbeddingModelType.TEXT_EMBED_ADA_002;

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
