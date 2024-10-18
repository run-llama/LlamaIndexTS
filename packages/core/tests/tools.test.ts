import { FunctionTool } from "@llamaindex/core/tools";
import { describe, test } from "vitest";
import { z } from "zod";

describe("FunctionTool", () => {
  test("type system", () => {
    FunctionTool.from((input: string) => input, {
      name: "test",
      description: "test",
    });
    FunctionTool.from(({ input }: { input: string }) => input, {
      name: "test",
      description: "test",
      parameters: {
        type: "object",
        properties: {
          input: {
            type: "string",
          },
        },
        required: ["input"],
      },
    });
    const inputSchema = z
      .object({
        input: z.string(),
      })
      .required();
    FunctionTool.from(({ input }: { input: string }) => input, {
      name: "test",
      description: "test",
      parameters: inputSchema,
    });
  });
});
