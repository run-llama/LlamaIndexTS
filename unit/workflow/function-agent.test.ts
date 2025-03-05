import {
  AgentToolCall,
  AgentToolCallResult,
  FunctionAgent,
  FunctionTool,
  type ChatMessage,
} from "llamaindex";
import { describe, expect, test } from "vitest";
import { z } from "zod";
import { setupMockLLM } from "./llm.js";

describe("FunctionAgent", () => {
  test("function agent can parse tool call results", async () => {
    // Create minimal tools
    const addTool = FunctionTool.from(
      (params: { x: number; y: number }) => params.x + params.y,
      {
        name: "add",
        description: "Adds two numbers",
        parameters: z.object({
          x: z.number(),
          y: z.number(),
        }),
      },
    );

    const calculatorAgent = new FunctionAgent({
      name: "CalculatorAgent",
      description: "Simple calculator",
      tools: [addTool],
      llm: setupMockLLM(),
    });

    const dummyResult = {
      data: {
        toolName: "add",
        toolKwargs: { x: 2, y: 2 },
        toolId: "123",
        toolOutput: { result: "4", isError: false, id: "123" },
        returnDirect: false,
      },
      displayName: "test",
    } as AgentToolCallResult;

    const dummyContext = {
      data: {
        scratchpad: [],
      },
    };

    await calculatorAgent.handleToolCallResults(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dummyContext as any,
      [dummyResult],
    );

    // Check if agent's scratchpad has been updated with the correct message
    expect(dummyContext.data.scratchpad.length).toEqual(1);
    const message = dummyContext.data.scratchpad[0] as unknown as ChatMessage;
    expect(message.content).toEqual("4");
    expect(message.role).toEqual("user");
    expect(message.options).toEqual({
      toolResult: {
        id: "123",
        isError: false,
        result: "4",
      },
    });
  });

  test("parse no tool call from response chunk", () => {
    const addTool = FunctionTool.from(
      (params: { x: number; y: number }) => params.x + params.y,
      {
        name: "add",
        description: "Adds two numbers",
        parameters: z.object({
          x: z.number(),
          y: z.number(),
        }),
      },
    );

    const calculatorAgent = new FunctionAgent({
      name: "CalculatorAgent",
      description: "Simple calculator",
      tools: [addTool],
      llm: setupMockLLM(),
    });

    const noToolCallResponseChunk = {
      delta: "4",
      raw: null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolCalls = (calculatorAgent as any).getToolCallFromResponseChunk(
      noToolCallResponseChunk,
    );
    expect(toolCalls.length).toEqual(0);
  });

  test("parse tool call from response chunk with tool call data", () => {
    const addTool = FunctionTool.from(
      (params: { x: number; y: number }) => params.x + params.y,
      {
        name: "add",
        description: "Adds two numbers",
        parameters: z.object({
          x: z.number(),
          y: z.number(),
        }),
      },
    );

    const calculatorAgent = new FunctionAgent({
      name: "CalculatorAgent",
      description: "Simple calculator",
      tools: [addTool],
      llm: setupMockLLM(),
    });

    // Test with a response chunk that contains tool call data
    const responseChunkWithToolCall = {
      delta: "I'll calculate that for you",
      raw: null,
      options: {
        toolCall: [
          {
            name: "add",
            input: JSON.stringify({ x: 5, y: 3 }),
          },
        ],
      },
    };

    // Access the private method using type assertion
    const toolCalls: AgentToolCall[] =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (calculatorAgent as any).getToolCallFromResponseChunk(
        responseChunkWithToolCall,
      );

    // Verify the tool calls were correctly extracted
    expect(toolCalls.length).toEqual(1);
    const toolCall = toolCalls[0];
    expect(toolCall?.data.toolName).toEqual("add");
    expect(toolCall?.data.toolKwargs).toEqual({ x: 5, y: 3 });
  });
});
