import {
  type CoreTool,
  type LanguageModelV1,
  type ToolExecutionOptions,
} from "ai";
import { beforeAll, describe, expect, test, vi } from "vitest";
import { llamaindex } from "../src/tool";

// Mock the ai package functions
vi.mock("ai", () => ({
  generateText: vi.fn().mockResolvedValue({
    text: "Hi there!",
    reasoning: "",
    sources: [],
    experimental_output: {},
    toolCalls: [],
    messages: [],
    data: {},
    usage: {},
    id: "test",
    createdAt: new Date(),
  }),
  streamText: vi.fn(),
  tool: vi.fn().mockImplementation((config) => ({
    name: config.name || "llamaindex",
    description: config.description,
    execute: config.execute,
  })),
}));

describe("llamaindex Tool", () => {
  let mockModel: LanguageModelV1;
  let mockToolOptions: ToolExecutionOptions;

  beforeAll(() => {
    mockModel = {
      modelId: "test-model",
    } as LanguageModelV1;

    mockToolOptions = {
      toolCallId: "test-call-id",
      messages: [],
    };
  });

  test("creates a tool with default description", () => {
    const mockIndex = {
      asQueryEngine: vi.fn().mockReturnValue({
        query: vi.fn().mockResolvedValue({
          message: { content: "Test response" },
        }),
      }),
    };

    const tool = llamaindex({
      model: mockModel,
      index: mockIndex,
    });

    expect(tool).toBeDefined();
    expect(typeof tool.execute).toBe("function");
  });

  test("creates a tool with custom description", () => {
    const mockIndex = {
      asQueryEngine: vi.fn().mockReturnValue({
        query: vi.fn().mockResolvedValue({
          message: { content: "Test response" },
        }),
      }),
    };

    const tool = llamaindex({
      model: mockModel,
      index: mockIndex,
      description: "Custom description",
    });

    expect(tool).toBeDefined();
    expect(typeof tool.execute).toBe("function");
  });

  describe("Tool Execution", () => {
    test("execute returns message content when no options specified", async () => {
      const mockQueryResult = {
        message: { content: "Test response" },
        sourceNodes: [{ text: "Source 1" }],
        metadata: { some: "data" },
      };

      const mockIndex = {
        asQueryEngine: vi.fn().mockReturnValue({
          query: vi.fn().mockResolvedValue(mockQueryResult),
        }),
      };

      const tool = llamaindex({
        model: mockModel,
        index: mockIndex,
      });

      // Ensure tool.execute exists before calling it
      expect(tool.execute).toBeDefined();
      const result = await (tool as Required<CoreTool>).execute(
        { query: "test query" },
        mockToolOptions,
      );
      expect(result).toBe("Test response");
    });

    test("execute returns specified fields when options provided", async () => {
      const mockQueryResult = {
        message: { content: "Test response" },
        sourceNodes: [{ text: "Source 1" }],
        metadata: { some: "data" },
      };

      const mockIndex = {
        asQueryEngine: vi.fn().mockReturnValue({
          query: vi.fn().mockResolvedValue(mockQueryResult),
        }),
      };

      const tool = llamaindex({
        model: mockModel,
        index: mockIndex,
        options: {
          fields: ["sourceNodes", "metadata"],
        },
      });

      // Ensure tool.execute exists before calling it
      expect(tool.execute).toBeDefined();
      const result = await (tool as Required<CoreTool>).execute(
        { query: "test query" },
        mockToolOptions,
      );
      expect(result).toEqual({
        message: { content: "Test response" },
        sourceNodes: [{ text: "Source 1" }],
        metadata: { some: "data" },
      });
    });

    test("execute returns 'No result found' when query returns no content", async () => {
      const mockIndex = {
        asQueryEngine: vi.fn().mockReturnValue({
          query: vi.fn().mockResolvedValue({
            message: { content: null },
          }),
        }),
      };

      const tool = llamaindex({
        model: mockModel,
        index: mockIndex,
      });

      // Ensure tool.execute exists before calling it
      expect(tool.execute).toBeDefined();
      const result = await (tool as Required<CoreTool>).execute(
        { query: "test query" },
        mockToolOptions,
      );
      expect(result).toBe("No result found in documents.");
    });
  });
});
