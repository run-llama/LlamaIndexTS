import { FunctionTool, ToolOutput } from "../../tools";
import { callToolWithErrorHandling } from "../../tools/utils";

function sumNumbers({ a, b }: { a: number; b: number }): number {
  return a + b;
}

const sumJSON = {
  type: "object",
  properties: {
    a: {
      type: "number",
      description: "The argument a to sum",
    },
    b: {
      type: "number",
      description: "The argument b to sum",
    },
  },
  required: ["a", "b"],
};

describe("Tools", () => {
  it("should be able to call a tool with a common JSON", async () => {
    const tool = new FunctionTool(sumNumbers, {
      name: "sumNumbers",
      description: "Use this function to sum numbers together",
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
