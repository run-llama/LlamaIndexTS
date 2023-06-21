import { DEFAULT_SIMILARITY_TOP_K } from "./constants";
import { OpenAISession, getOpenAISession } from "./openai";

export enum SimilarityType {
  DEFAULT = "cosine",
  DOT_PRODUCT = "dot_product",
  EUCLIDEAN = "euclidean",
}

export function getTopKEmbeddings(
  query_embedding: number[],
  embeddings: number[][],
  similarityTopK: number = DEFAULT_SIMILARITY_TOP_K,
  embeddingIds: any[] | null = null,
  similarityCutoff: number | null = null
): [number[], any[]] {
  if (embeddingIds == null) {
    embeddingIds = Array(embeddings.length).map((_, i) => i);
  }

  if (embeddingIds.length !== embeddings.length) {
    throw new Error(
      "getTopKEmbeddings: embeddings and embeddingIds length mismatch"
    );
  }

  let similarities: { similarity: number; id: number }[] = [];

  for (let i = 0; i < embeddings.length; i++) {
    let similarity = BaseEmbedding.similarity(query_embedding, embeddings[i]);
    if (similarityCutoff == null || similarity > similarityCutoff) {
      similarities.push({ similarity: similarity, id: embeddingIds[i] });
    }
  }

  similarities.sort((a, b) => b.similarity - a.similarity); // Reverse sort

  let resultSimilarities: number[] = [];
  let resultIds: any[] = [];

  for (let i = 0; i < similarityTopK; i++) {
    if (i >= similarities.length) {
      break;
    }
    resultSimilarities.push(similarities[i].similarity);
    resultIds.push(similarities[i].id);
  }

  return [resultSimilarities, resultIds];
}

export abstract class BaseEmbedding {
  static similarity(
    embedding1: number[],
    embedding2: number[],
    mode: SimilarityType = SimilarityType.DOT_PRODUCT
  ): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error("Embedding length mismatch");
    }

    if (mode === SimilarityType.DOT_PRODUCT) {
      let result = 0;
      for (let i = 0; i < embedding1.length; i++) {
        result += embedding1[i] * embedding2[i];
      }
      return result;
    } else {
      throw new Error("Not implemented yet");
    }
  }

  abstract aGetTextEmbedding(text: string): Promise<number[]>;
  abstract aGetQueryEmbedding(query: string): Promise<number[]>;
}

enum OpenAIEmbeddingModelType {
  TEXT_EMBED_ADA_002 = "text-embedding-ada-002",
}

export class OpenAIEmbedding extends BaseEmbedding {
  session: OpenAISession;
  model: OpenAIEmbeddingModelType;

  constructor() {
    super();

    this.session = getOpenAISession();
    this.model = OpenAIEmbeddingModelType.TEXT_EMBED_ADA_002;
  }

  private async _aGetOpenAIEmbedding(input: string) {
    input = input.replace(/\n/g, " ");
    //^ NOTE this performance helper is in the OpenAI python library but may not be in the JS library

    const { data } = await this.session.openai.createEmbedding({
      model: this.model,
      input,
    });

    return data.data[0].embedding;
  }

  async aGetTextEmbedding(text: string): Promise<number[]> {
    return this._aGetOpenAIEmbedding(text);
  }

  async aGetQueryEmbedding(query: string): Promise<number[]> {
    return this._aGetOpenAIEmbedding(query);
  }
}
