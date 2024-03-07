import {
  BaseTool,
  ToolMetadata,
  ToolParameterProperty,
  ToolParameters,
} from "../base";

function getDefaultMetadata(): ToolMetadata {
  const properties = new Map<string, ToolParameterProperty>();
  const paramProperty = new ToolParameterProperty(
    "string",
    "The query to search for",
  );
  properties.set("query", paramProperty);
  return new ToolMetadata(
    "query_engine_tool",
    "Useful for running a natural language query against a knowledge base and get back a natural language response.",
    new ToolParameters("object", properties, ["query"]),
    null,
  );
}

class QueryEngineTool extends BaseTool {
  call(_args: Object): string {
    // TODO: Implement this tool later
    return "QueryEngineTool.call";
  }

  constructor() {
    super(getDefaultMetadata());
  }
}

export function getInstance(): QueryEngineTool {
  return new QueryEngineTool();
}
