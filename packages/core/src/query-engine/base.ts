import { randomUUID } from "@llamaindex/env";
import { Settings } from "../global";
import type { MessageContent } from "../llms";
import { EngineResponse } from "../schema";
import { wrapEventCaller } from "../utils";

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

export abstract class BaseQueryEngine {
  protected constructor(
    protected readonly _query: (
      strOrQueryBundle: QueryType,
      stream: boolean,
    ) => Promise<EngineResponse>,
  ) {}

  query(
    strOrQueryBundle: QueryType,
    stream: true,
  ): Promise<AsyncIterable<EngineResponse>>;
  query(strOrQueryBundle: QueryType, stream?: false): Promise<EngineResponse>;
  @wrapEventCaller
  async query(
    strOrQueryBundle: QueryType,
    stream = false,
  ): Promise<EngineResponse | AsyncIterable<EngineResponse>> {
    const id = randomUUID();
    const callbackManager = Settings.callbackManager;
    callbackManager.dispatchEvent("query-start", {
      id,
      query: strOrQueryBundle,
    });
    const response = await this._query(strOrQueryBundle, stream);
    callbackManager.dispatchEvent("query-end", {
      id,
      response,
    });
    return response;
  }
}
