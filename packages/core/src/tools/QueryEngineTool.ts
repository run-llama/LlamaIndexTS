import { BaseQueryEngine, BaseTool, ToolMetadata } from "../types.js";

export type QueryEngineToolParams = {
  queryEngine: BaseQueryEngine;
  metadata: ToolMetadata;
};

type QueryEngineCallParams = {
  query: string;
};

const DEFAULT_NAME = "query_engine_tool";
const DEFAULT_DESCRIPTION =
  "Useful for running a natural language query against a knowledge base and get back a natural language response.";
const DEFAULT_PARAMETERS = {
  type: "object",
  properties: {
    query: {
      type: "string",
      description: "The query to search for",
    },
  },
  required: ["query"],
};

export class QueryEngineTool implements BaseTool {
  private queryEngine: BaseQueryEngine;
  metadata: ToolMetadata;

  constructor({ queryEngine, metadata }: QueryEngineToolParams) {
    this.queryEngine = queryEngine;
    this.metadata = {
      name: metadata?.name ?? DEFAULT_NAME,
      description: metadata?.description ?? DEFAULT_DESCRIPTION,
      parameters: metadata?.parameters ?? DEFAULT_PARAMETERS,
    };
  }

  async call(...args: QueryEngineCallParams[]): Promise<any> {
    let queryStr: string;

    if (args && args.length > 0) {
      queryStr = String(args[0].query);
    } else {
      throw new Error(
        "Cannot call query engine without specifying `input` parameter.",
      );
    }

    const response = await this.queryEngine.query({ query: queryStr });

    return response.response;
  }
}
