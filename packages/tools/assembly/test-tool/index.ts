import {
  BaseTool,
  ToolMetadata,
  ToolParameterProperty,
  ToolParameterPropertyRecord,
  ToolParameters,
} from "../base";
import { http } from "../libs";

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
    const headers = new Map<string, string>();

    let result: string = "";
    http.get(
      "https://jsonplaceholder.typicode.com/todos/1",
      headers,
      (res: string) => {
        result += res;
      },
    );

    return (
      "Tool: " +
      this.metadata.name +
      "\nQuery: " +
      query +
      " \n>> Result: " +
      result
    );
  }
}

export * from "../base";
