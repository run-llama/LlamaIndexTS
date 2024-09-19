import { MultiModalEmbedding } from "@llamaindex/core/embeddings";
import { getEnv } from "@llamaindex/env";
import { imageToDataUrl } from "../internal/utils.js";
import type { ImageType } from "../Node.js";

function isLocal(url: ImageType): boolean {
  if (url instanceof Blob) return true;
  return new URL(url).protocol === "file:";
}

type TaskType =
  | "retrieval.passage"
  | "retrieval.query"
  | "separation"
  | "classification"
  | "text-matching";
type EncodingType = "float" | "binary" | "ubinary";

export type JinaEmbeddingRequest = {
  input: Array<{ text: string } | { url: string } | { bytes: string }>;
  model?: string;
  encoding_type?: EncodingType;
  task?: TaskType;
  dimensions?: number;
  late_chunking?: boolean;
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

const JINA_MULTIMODAL_MODELS = ["jina-clip-v1"];

export class JinaAIEmbedding extends MultiModalEmbedding {
  apiKey: string;
  model: string;
  baseURL: string;
  task?: TaskType | undefined;
  encodingType?: EncodingType | undefined;
  dimensions?: number | undefined;
  late_chunking?: boolean | undefined;

  async getTextEmbedding(text: string): Promise<number[]> {
    const result = await this.getJinaEmbedding({ input: [{ text }] });
    return result.data[0]!.embedding;
  }

  async getImageEmbedding(image: ImageType): Promise<number[]> {
    const img = await this.getImageInput(image);
    const result = await this.getJinaEmbedding({ input: [img] });
    return result.data[0]!.embedding;
  }

  // Retrieve multiple text embeddings in a single request
  getTextEmbeddings = async (texts: string[]): Promise<Array<number[]>> => {
    const input = texts.map((text) => ({ text }));
    const result = await this.getJinaEmbedding({ input });
    return result.data.map((d) => d.embedding);
  };

  // Retrieve multiple image embeddings in a single request
  async getImageEmbeddings(images: ImageType[]): Promise<number[][]> {
    const input = await Promise.all(
      images.map((img) => this.getImageInput(img)),
    );
    const result = await this.getJinaEmbedding({ input });
    return result.data.map((d) => d.embedding);
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
    this.model = init?.model ?? "jina-embeddings-v3";
    this.baseURL = init?.baseURL ?? "https://api.jina.ai/v1/embeddings";
    init?.embedBatchSize && (this.embedBatchSize = init?.embedBatchSize);
    this.task = init?.task;
    this.encodingType = init?.encodingType;
    this.dimensions = init?.dimensions;
    this.late_chunking = init?.late_chunking;
  }

  private async getImageInput(
    image: ImageType,
  ): Promise<{ bytes: string } | { url: string }> {
    if (isLocal(image) || image instanceof Blob) {
      const base64 = await imageToDataUrl(image);
      const bytes = base64.split(",")[1]!;
      return { bytes };
    } else {
      return { url: image.toString() };
    }
  }

  private async getJinaEmbedding(
    params: JinaEmbeddingRequest,
  ): Promise<JinaEmbeddingResponse> {
    // if input includes image, check if model supports multimodal embeddings
    if (
      params.input.some((i) => "url" in i || "bytes" in i) &&
      !JINA_MULTIMODAL_MODELS.includes(this.model)
    ) {
      throw new Error(
        `Model ${this.model} does not support image embeddings. Use ${JINA_MULTIMODAL_MODELS.join(", ")}`,
      );
    }

    const response = await fetch(this.baseURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        encoding_type: this.encodingType ?? "float",
        ...(this.task && { task: this.task }),
        ...(this.dimensions !== undefined && { dimensions: this.dimensions }),
        ...(this.late_chunking !== undefined && {
          late_chunking: this.late_chunking,
        }),
        ...params,
      }),
    });
    if (!response.ok) {
      const reason = await response.text();

      throw new Error(
        `Request failed with status ${response.status}: ${reason}`,
      );
    }
    const result: JinaEmbeddingResponse = await response.json();
    return {
      ...result,
      data: result.data.sort((a, b) => a.index - b.index), // Sort resulting embeddings by index
    };
  }
}
