// from typing import TYPE_CHECKING, Any, Optional

import { BaseQueryEngine, BaseTool, ToolMetadata } from "../types";

export type QueryEngineToolParams = {
  queryEngine: BaseQueryEngine;
  metadata: ToolMetadata;
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
  private _queryEngine: BaseQueryEngine;
  private _metadata: ToolMetadata;

  constructor({ queryEngine, metadata }: QueryEngineToolParams) {
    this._queryEngine = queryEngine;
    this._metadata = {
      name: metadata?.name ?? DEFAULT_NAME,
      description: metadata?.description ?? DEFAULT_DESCRIPTION,
      parameters: metadata?.parameters ?? DEFAULT_PARAMETERS,
    };
  }

  get metadata() {
    return this._metadata;
  }

  async call(...args: any[]): Promise<any> {
    let queryStr: string;

    if (args && args.length > 0) {
      queryStr = String(args[0].query);
    } else {
      throw new Error(
        "Cannot call query engine without specifying `input` parameter.",
      );
    }

    const response = await this._queryEngine.query({ query: queryStr });

    return response.response;
  }
}
