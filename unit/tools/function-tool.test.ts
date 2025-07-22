import { FunctionTool } from "@llamaindex/core/tools";
import { describe, expect, test } from "vitest";
import * as z from "zod/v4";

describe("function-tool", () => {
  test("zod type check", () => {
    const inputSchema = z.object({
      name: z.string(),
      age: z.coerce.number(),
    });
    const tool = FunctionTool.from(
      (input) => {
        if (typeof input.age !== "number") {
          throw new Error("Age should be a number");
        }
        return "Hello " + input.name + " " + input.age;
      },
      {
        name: "get-user",
        description: "Get user by name and age",
        parameters: inputSchema,
      },
    );
    {
      const response = tool.call({ name: "John", age: 30 });
      expect(response).toBe("Hello John 30");
    }
    {
      // @ts-expect-error age should be a number
      const response = tool.call({ name: "John", age: "30" });
      expect(response).toBe("Hello John 30");
    }
  });
});
