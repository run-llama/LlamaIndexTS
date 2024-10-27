import { randomUUID } from "@llamaindex/env";
import { wrapEventCaller } from "../decorator";
import { Settings } from "../global";
import type { MessageContent } from "../llms";
import { PromptMixin } from "../prompts";
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

export type BaseQueryParams = {
  query: QueryType;
};

export interface StreamingQueryParams extends BaseQueryParams {
  stream: true;
}

export interface NonStreamingQueryParams extends BaseQueryParams {
  stream?: false;
}

export type QueryFn = (
  strOrQueryBundle: QueryType,
  stream?: boolean,
) => Promise<AsyncIterable<EngineResponse> | EngineResponse>;

export abstract class BaseQueryEngine extends PromptMixin {
  abstract _query(
    strOrQueryBundle: QueryType,
    stream?: boolean,
  ): Promise<AsyncIterable<EngineResponse> | EngineResponse>;

  async retrieve(params: QueryType): Promise<NodeWithScore[]> {
    throw new Error(
      "This query engine does not support retrieve, use query directly",
    );
  }

  query(params: StreamingQueryParams): Promise<AsyncIterable<EngineResponse>>;
  query(params: NonStreamingQueryParams): Promise<EngineResponse>;
  @wrapEventCaller
  async query(
    params: StreamingQueryParams | NonStreamingQueryParams,
  ): Promise<EngineResponse | AsyncIterable<EngineResponse>> {
    const { stream, query } = params;
    const id = randomUUID();
    const callbackManager = Settings.callbackManager;
    callbackManager.dispatchEvent("query-start", {
      id,
      query,
    });
    const response = await this._query(query, stream);
    callbackManager.dispatchEvent("query-end", {
      id,
      response,
    });
    return response;
  }
}
