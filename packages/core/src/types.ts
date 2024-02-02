/**
 * Top level types to avoid circular dependencies
 */
import { Event } from "./callbacks/CallbackManager";
import { Response } from "./Response";

/**
 * Parameters for sending a query.
 */
export interface QueryEngineParamsBase {
  query: string;
  parentEvent?: Event;
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

export class QueryBundle {
  queryStr: string;

  constructor(queryStr: string) {
    this.queryStr = queryStr;
  }

  toString(): string {
    return this.queryStr;
  }
}
