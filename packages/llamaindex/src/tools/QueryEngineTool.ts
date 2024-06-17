import type { JSONSchemaType } from "ajv";
import type { BaseTool, QueryEngine, ToolMetadata } from "../types.js";

const DEFAULT_NAME = "query_engine_tool";
const DEFAULT_DESCRIPTION =
  "Useful for running a natural language query against a knowledge base and get back a natural language response.";

const DEFAULT_PARAMETERS: JSONSchemaType<QueryEngineParam> = {
  type: "object",
  properties: {
    query: {
      type: "string",
      description: "The query to search for",
    },
  },
  required: ["query"],
};

export type QueryEngineToolParams = {
  queryEngine: QueryEngine;
  metadata: ToolMetadata<JSONSchemaType<QueryEngineParam>>;
};

export type QueryEngineParam = {
  query: string;
};

export class QueryEngineTool implements BaseTool<QueryEngineParam> {
  private queryEngine: QueryEngine;
  metadata: ToolMetadata<JSONSchemaType<QueryEngineParam>>;

  constructor({ queryEngine, metadata }: QueryEngineToolParams) {
    this.queryEngine = queryEngine;
    this.metadata = {
      name: metadata?.name ?? DEFAULT_NAME,
      description: metadata?.description ?? DEFAULT_DESCRIPTION,
      parameters: metadata?.parameters ?? DEFAULT_PARAMETERS,
    };
  }

  async call({ query }: QueryEngineParam) {
    const response = await this.queryEngine.query({ query });

    return response.response;
  }
}
