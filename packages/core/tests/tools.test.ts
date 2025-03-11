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
      parameters: z.object({
        input: z.string(),
      }),
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

  test("create with execute attribute", async () => {
    // Mock function to be passed as execute attribute
    const mockExecute = vi.fn().mockImplementation(({ content }) => {
      return `File saved with content: ${content}`;
    });

    // Create tool using an execute attribute
    const saveTool = FunctionTool.from({
      name: "saveFile",
      description: "Save the content into a file",
      parameters: z.object({
        content: z.string({
          description: "The content to save into a file",
        }),
      }),
      execute: mockExecute,
    });

    // Call the tool and verify
    const result = await saveTool.call({ content: "test content" });
    expect(mockExecute).toHaveBeenCalledOnce();
    expect(mockExecute).toHaveBeenCalledWith(
      { content: "test content" },
      undefined,
    );
    expect(result).toBe("File saved with content: test content");
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
