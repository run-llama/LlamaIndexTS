import { FunctionTool, ToolOutput } from "llamaindex/tools/index";
import { callToolWithErrorHandling } from "llamaindex/tools/utils";
import { describe, expect, it } from "vitest";

function sumNumbers({ a, b }: { a: number; b: number }): number {
  return a + b;
}

const sumJSON = {
  type: "object",
  properties: {
    a: {
      type: "number",
      description: "The first number",
    },
    b: {
      type: "number",
      description: "The second number",
    },
  },
  required: ["a", "b"],
};

describe("Tools", () => {
  it("should be able to call a tool with a common JSON", async () => {
    const tool = new FunctionTool(sumNumbers, {
      name: "sumNumbers",
      description: "Use this function to sum two numbers",
      parameters: sumJSON,
    });

    const response = await callToolWithErrorHandling(tool, {
      a: 1,
      b: 2,
    });

    expect(response).toEqual(
      new ToolOutput(
        response.content,
        tool.metadata.name,
        { a: 1, b: 2 },
        response.content,
      ),
    );
  });
});
