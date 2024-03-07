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
    "wiki_tool",
    "Summary of the Wikipedia page for the given query.",
    new ToolParameters("object", properties, ["query"]),
    null,
  );
}

class WikiTool extends BaseTool {
  call(_args: Object): string {
    // TODO: Implement this tool later
    return "WikiTool.call";
  }

  constructor() {
    super(getDefaultMetadata());
  }
}

export function getInstance(): WikiTool {
  return new WikiTool();
}
