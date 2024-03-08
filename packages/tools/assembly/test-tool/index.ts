import { ToolMetadata } from "../base";

export const defaultMetadata: ToolMetadata = {
  name: "TestTool",
  description: "Demo tool for testing purposes.",
  parameters: {
    type: "object",
    properties: [
      {
        key: "query",
        value: {
          type: "string",
          description: "The text query to search",
        },
      },
    ],
    required: ["query"],
  },
  argsKwargs: null,
};

export function call(query: string): string {
  return "Result from TestTool for query: " + query;
}
