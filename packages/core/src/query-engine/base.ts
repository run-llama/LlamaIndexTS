import type { MessageContent } from "../llms";
import { EngineResponse, type NodeWithScore } from "../schema";

/**
 * @link https://docs.llamaindex.ai/en/stable/api_reference/schema/?h=querybundle#llama_index.core.schema.QueryBundle
 *
 *  We don't have `image_path` here, because it is included in the `query` field.
 */
export type QueryBundle = {
  query: MessageContent;
  customEmbeddings?: string[];
  embeddings?: number[];
};

export type QueryType = string | QueryBundle;

export interface BaseQueryEngine {
  query(
    strOrQueryBundle: QueryType,
    stream: true,
  ): Promise<AsyncIterable<EngineResponse>>;
  query(strOrQueryBundle: QueryType, stream?: false): Promise<EngineResponse>;

  synthesize?(
    strOrQueryBundle: QueryType,
    nodes: NodeWithScore[],
    additionalSources?: Iterator<NodeWithScore>,
  ): Promise<EngineResponse>;
}
