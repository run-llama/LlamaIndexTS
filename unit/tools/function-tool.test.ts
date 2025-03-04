import { FunctionTool } from "@llamaindex/core/tools";
import { describe, expect, test, vi } from "vitest";
import { z } from "zod";

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

  test("bind additional argument", () => {
    type AdditionalHelloArgument = {
      question?: string;
    };

    const hello = vi
      .fn()
      .mockImplementation((name: string, arg?: AdditionalHelloArgument) => {
        return `Hello ${name}. ${arg?.question ?? ""}`;
      });

    const helloTool = FunctionTool.from<string, AdditionalHelloArgument>(
      hello,
      {
        name: "hello",
        description: "Says hello",
      },
    );

    helloTool.call("Alice");
    expect(hello).to.toHaveBeenCalledOnce();
    expect(hello).to.toHaveBeenCalledWith("Alice", undefined);

    hello.mockReset();

    const additionalArg = {
      question: "How is it going?",
    };
    const helloBoundTool = helloTool.bind(additionalArg);
    helloBoundTool.call("Bob");
    expect(hello).to.toHaveBeenCalledOnce();
    expect(hello).to.toHaveBeenCalledWith("Bob", additionalArg);
  });
});
