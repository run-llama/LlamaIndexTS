import {
  BaseTool,
  ToolMetadata,
  ToolParameterProperty,
  ToolParameterPropertyRecord,
  ToolParameters,
} from "../base";

export const defaultMetadata: ToolMetadata = new ToolMetadata(
  "Test Tool",
  "This is a test tool",
  new ToolParameters(
    "object",
    [
      new ToolParameterPropertyRecord(
        "query",
        new ToolParameterProperty("string", "The text query to search"),
      ),
    ],
    ["query"],
  ),
  null,
);

export class Tool extends BaseTool {
  constructor(metadata: ToolMetadata | null) {
    super();
    this.metadata = metadata ? metadata : defaultMetadata;
  }

  call(query: string): string {
    return (
      "Tool: " +
      this.metadata.name +
      "\nQuery: " +
      query +
      " \n>> Result show here..."
    );
  }
}

export * from "../base";
