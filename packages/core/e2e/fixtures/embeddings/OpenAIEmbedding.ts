import { BaseNode, SimilarityType, type BaseEmbedding } from "llamaindex";

export class OpenAIEmbedding implements BaseEmbedding {
  embedBatchSize = 512;

  async getQueryEmbedding(query: string) {
    return [0];
  }

  async getTextEmbedding(text: string) {
    return [0];
  }

  async getTextEmbeddings(texts: string[]) {
    return [[0]];
  }

  async getTextEmbeddingsBatch(texts: string[]) {
    return [[0]];
  }

  similarity(
    embedding1: number[],
    embedding2: number[],
    mode?: SimilarityType,
  ) {
    return 1;
  }

  async transform(nodes: BaseNode[], _options?: any): Promise<BaseNode[]> {
    nodes.forEach((node) => (node.embedding = [0]));
    return nodes;
  }
}
