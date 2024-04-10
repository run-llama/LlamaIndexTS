/**
 * Top level types to avoid circular dependencies
 */
import type { Response } from "./Response.js";

/**
 * @link https://docs.llamaindex.ai/en/stable/api_reference/schema/?h=querybundle#llama_index.core.schema.QueryBundle
 *
 *  We don't have `image_path` here, because it is included in the `query` field.
 */
export type QueryBundle = {
  query: MessageContent;
  embedding?: number[];
};

export type MessageContentTextDetail = {
  type: "text";
  text: string;
};

export type MessageContentImageDetail = {
  type: "image_url";
  image_url: {
    url: string;
  };
};

export type MessageContentDetail =
  | MessageContentTextDetail
  | MessageContentImageDetail;

/**
 * Extended type for the content of a message that allows for multi-modal messages.
 */
export type MessageContent = string | MessageContentDetail[];

/**
 * Parameters for sending a query.
 */
export type QueryEngineParamsBase = {
  query: MessageContent | QueryBundle;
};

export type QueryEngineParamsStreaming = QueryEngineParamsBase & {
  stream: true;
};

export type QueryEngineParamsNonStreaming = QueryEngineParamsBase & {
  stream?: false;
};

/**
 * A query engine is a question answerer that can use one or more steps.
 */
export interface BaseQueryEngine {
  /**
   * Query the query engine and get a response.
   * @param params
   */
  query(params: QueryEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  query(params: QueryEngineParamsNonStreaming): Promise<Response>;
}

/**
 * Simple Tool interface. Likely to change.
 */
export interface BaseTool {
  call?: (...args: any[]) => any;
  metadata: ToolMetadata;
}

/**
 * An OutputParser is used to extract structured data from the raw output of the LLM.
 */
export interface BaseOutputParser<T> {
  parse(output: string): T;

  format(output: string): string;
}

/**
 * StructuredOutput is just a combo of the raw output and the parsed output.
 */
export interface StructuredOutput<T> {
  rawOutput: string;
  parsedOutput: T;
}

export type ToolParameters = {
  type: string | "object";
  properties: Record<string, { type: string; description?: string }>;
  required?: string[];
};

export interface ToolMetadata {
  description: string;
  name: string;
  parameters?: ToolParameters;
  argsKwargs?: Record<string, any>;
}

export type ToolMetadataOnlyDescription = Pick<ToolMetadata, "description">;

export type UUID = `${string}-${string}-${string}-${string}-${string}`;
