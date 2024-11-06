import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { BaseEmbedding } from "@llamaindex/core/embeddings";
import type { MessageContentDetail } from "@llamaindex/core/llms";
import { extractSingleText } from "@llamaindex/core/utils";

export enum PROVIDERS {
  AMAZON = "amazon",
}

export enum ALL_BEDROCK_EMBEDDING_MODELS {
  TITAN_EMBEDDING = "amazon.titan-embed-text-v1",
  TITAN_EMBEDDING_V2_0 = "amazon.titan-embed-text-v2:0",
  TITAN_EMBEDDING_G1_TEXT_02 = "amazon.titan-embed-g1-text-02",
}

const PROVIDER_SPECIFIC_IDENTIFIERS = {
  [PROVIDERS.AMAZON]: {
    getEmbeddingsFunc: (response: any) => response.embedding,
  },
};

export class BedrockEmbedding extends BaseEmbedding {
  private client: BedrockRuntimeClient;
  private modelName: string;
  private region: string;
  public embedBatchSize: number = 10;

  constructor({
    modelName = ALL_BEDROCK_EMBEDDING_MODELS.TITAN_EMBEDDING,
    awsAccessKeyId,
    awsSecretAccessKey,
    awsSessionToken,
    region = "us-east-1",
  }: {
    modelName?: string;
    awsAccessKeyId?: string;
    awsSecretAccessKey?: string;
    awsSessionToken?: string;
    region?: string;
  }) {
    super();
    this.modelName = modelName;
    this.region = region;

    this.client = new BedrockRuntimeClient({
      region: this.region,
      credentials: {
        accessKeyId: awsAccessKeyId || "",
        secretAccessKey: awsSecretAccessKey || "",
        sessionToken: awsSessionToken || "",
      },
    });
  }

  public static listSupportedModels(): { [key: string]: string[] } {
    const listModels: { [key: string]: string[] } = {};
    for (const provider of Object.values(PROVIDERS)) {
      listModels[provider] = Object.values(ALL_BEDROCK_EMBEDDING_MODELS).filter(
        (model) => model.startsWith(provider),
      );
    }
    return listModels;
  }

  private async getEmbedding(payload: string | string[]): Promise<any> {
    if (!this.client) throw new Error("Client not set");

    const provider = this.modelName.split(".")[0] as PROVIDERS;
    const requestBody = this.getRequestBody(provider, payload);

    const command = new InvokeModelCommand({
      modelId: this.modelName,
      body: requestBody,
      accept: "application/json",
      contentType: "application/json",
    });

    const response = await this.client.send(command);
    const resp = JSON.parse(new TextDecoder().decode(response.body));
    const identifiers = PROVIDER_SPECIFIC_IDENTIFIERS[provider];
    if (!identifiers) throw new Error("Provider not supported");

    return identifiers.getEmbeddingsFunc(resp);
  }

  private getRequestBody(provider: PROVIDERS, payload: string | string[]): any {
    if (provider === PROVIDERS.AMAZON) {
      if (Array.isArray(payload))
        throw new Error("Amazon provider does not support list of texts");
      return JSON.stringify({ inputText: payload });
    } else {
      throw new Error("Provider not supported");
    }
  }

  public async getTextEmbedding(text: string): Promise<any> {
    return this.getEmbedding(text);
  }

  getTextEmbeddings = async (texts: string[]): Promise<number[][]> => {
    return this.getEmbeddingBatch(texts);
  };

  public async getQueryEmbedding(
    query: MessageContentDetail,
  ): Promise<number[] | null> {
    const text = extractSingleText(query);
    if (text) {
      return this.getEmbedding(text);
    } else {
      return null;
    }
  }
  public async getEmbeddingBatch(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];

    for (const text of texts) {
      const embedding = await this.getEmbedding(text);
      embeddings.push(embedding);
    }

    return embeddings;
  }
}
