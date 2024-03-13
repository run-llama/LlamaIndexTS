import {
  ToolMetadata,
  ToolParameterProperty,
  ToolParameterPropertyRecord,
  ToolParameters,
} from "../base";
import * as http from "../http";
export * from "../base";

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
);

export function call(id: string): void {
  http.get(`https://jsonplaceholder.typicode.com/todos?id=${id}`, "");
}
