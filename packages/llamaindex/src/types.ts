/**
 * Top level types to avoid circular dependencies
 */
import type { ToolMetadata } from "@llamaindex/core/llms";
import type { EngineResponse } from "./EngineResponse.js";

/**
 * Parameters for sending a query.
 */
export interface QueryEngineParamsBase {
  query: string;
}

export interface QueryEngineParamsStreaming extends QueryEngineParamsBase {
  stream: true;
}

export interface QueryEngineParamsNonStreaming extends QueryEngineParamsBase {
  stream?: false | null;
}

/**
 * A query engine is a question answerer that can use one or more steps.
 */
export interface QueryEngine {
  /**
   * Query the query engine and get a response.
   * @param params
   */
  query(
    params: QueryEngineParamsStreaming,
  ): Promise<AsyncIterable<EngineResponse>>;
  query(params: QueryEngineParamsNonStreaming): Promise<EngineResponse>;
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

export type ToolMetadataOnlyDescription = Pick<ToolMetadata, "description">;

export class QueryBundle {
  queryStr: string;

  constructor(queryStr: string) {
    this.queryStr = queryStr;
  }

  toString(): string {
    return this.queryStr;
  }
}

export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export type JSONValue = string | number | boolean | JSONObject | JSONArray;

export type JSONObject = {
  [key: string]: JSONValue;
};

type JSONArray = Array<JSONValue>;
