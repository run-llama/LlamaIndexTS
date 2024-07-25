import { TransformComponent } from "@llamaindex/core/schema";
import {
  BaseEmbedding,
  BaseNode,
  SimilarityType,
  type EmbeddingInfo,
  type MessageContentDetail,
} from "llamaindex";

export class OpenAIEmbedding
  extends TransformComponent
  implements BaseEmbedding
{
  embedInfo?: EmbeddingInfo | undefined;
  embedBatchSize = 512;

  constructor() {
    super(async (nodes) => nodes);
  }

  async getQueryEmbedding(query: MessageContentDetail) {
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

  truncateMaxTokens(input: string[]): string[] {
    return input;
  }
}
