import { getEnv } from "@llamaindex/env";
import type { ImageType } from "../Node.js";
import { MultiModalEmbedding } from "./MultiModalEmbedding.js";
import { imageToDataUrl } from "./utils.js";

function isLocal(url: ImageType): boolean {
  if (url instanceof Blob) return false;
  return new URL(url).protocol === "file:";
}

export type JinaEmbeddingRequest = {
  input: Array<{ text: string } | { url: string } | { bytes: string }>;
  model?: string;
  encoding_type?: "float" | "binary" | "ubinary";
};

export type JinaEmbeddingResponse = {
  model: string;
  object: string;
  usage: {
    total_tokens: number;
    prompt_tokens: number;
  };
  data: Array<{
    object: string;
    index: number;
    embedding: number[];
  }>;
};

export class JinaAIEmbedding extends MultiModalEmbedding {
  apiKey: string;
  model: string;
  baseURL: string;

  async getTextEmbedding(text: string): Promise<number[]> {
    const result = await this.getJinaEmbedding({
      input: [{ text }],
    });
    return result.data[0].embedding;
  }

  async getImageEmbedding(image: ImageType): Promise<number[]> {
    let input = [];
    if (isLocal(image)) {
      const bytes = await imageToDataUrl(image);
      input = [{ bytes }];
    } else {
      input = [{ url: image.toString() }];
    }
    const result = await this.getJinaEmbedding({ input });
    return result.data[0].embedding;
  }

  constructor(init?: Partial<JinaAIEmbedding>) {
    super();
    const apiKey = init?.apiKey ?? getEnv("JINAAI_API_KEY");
    if (!apiKey) {
      throw new Error(
        "Set Jina AI API Key in JINAAI_API_KEY env variable. Get one for free or top up your key at https://jina.ai/embeddings",
      );
    }
    this.apiKey = apiKey;
    this.model = init?.model ?? "jina-embeddings-v2-base-en";
    this.baseURL = init?.baseURL ?? "https://api.jina.ai/v1/embeddings";
  }

  private async getJinaEmbedding(
    input: JinaEmbeddingRequest,
  ): Promise<JinaEmbeddingResponse> {
    const response = await fetch(this.baseURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        encoding_type: "float",
        ...input,
      }),
    });
    if (!response.ok) {
      throw new Error(
        `Request ${this.baseURL} failed with status ${response.status}`,
      );
    }
    const result: JinaEmbeddingResponse = await response.json();
    return {
      ...result,
      data: result.data.sort((a, b) => a.index - b.index), // Sort resulting embeddings by index
    };
  }
}
