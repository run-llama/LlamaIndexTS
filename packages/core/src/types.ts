/**
 * Top level types to avoid circular dependencies
 */
import { type JSONSchemaType } from "ajv";
import type { Response } from "./Response.js";

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
  query(params: QueryEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  query(params: QueryEngineParamsNonStreaming): Promise<Response>;
}

type Known =
  | { [key: string]: Known }
  | [Known, ...Known[]]
  | Known[]
  | number
  | string
  | boolean
  | null;

export type ToolMetadata<
  Parameters extends Record<string, unknown> = Record<string, unknown>,
> = {
  description: string;
  name: string;
  /**
   * OpenAI uses JSON Schema to describe the parameters that a tool can take.
   * @link https://json-schema.org/understanding-json-schema
   */
  parameters?: Parameters;
};

/**
 * Simple Tool interface. Likely to change.
 */
export interface BaseTool<Input = any> {
  /**
   * This could be undefined if the implementation is not provided,
   *  which might be the case when communicating with a llm.
   *
   * @return {JSONValue | Promise<JSONValue>} The output of the tool.
   */
  call?: (input: Input) => JSONValue | Promise<JSONValue>;
  metadata: // if user input any, we cannot check the schema
  Input extends Known ? ToolMetadata<JSONSchemaType<Input>> : ToolMetadata;
}

export type BaseToolWithCall<Input = any> = Omit<BaseTool<Input>, "call"> & {
  call: NonNullable<Pick<BaseTool<Input>, "call">["call"]>;
};

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

export type ToolOutput = {
  tool: BaseTool | undefined;
  // all of existing function calling LLMs only support object input
  input: JSONObject;
  output: JSONValue;
  isError: boolean;
};
