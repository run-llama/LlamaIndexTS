import { FunctionTool } from "@llamaindex/core/tools";
import { describe, expect, test, vi } from "vitest";
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
