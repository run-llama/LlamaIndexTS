import { ChatMessage } from "@llamaindex/core/llms";
import { tool } from "@llamaindex/core/tools";
import { MockLLM } from "@llamaindex/core/utils";
import { describe, expect, test } from "vitest";
import { z } from "zod";
import { AgentToolCallResult, FunctionAgent } from "../src/agent";

const mockLLM = new MockLLM();
mockLLM.supportToolCall = true;

describe("FunctionAgent", () => {
  test("function agent can parse tool call results", async () => {
    // Create minimal tools
    const addTool = tool({
      name: "add",
      description: "Adds two numbers",
      parameters: z.object({
        x: z.number(),
        y: z.number(),
      }),
      execute: (params: { x: number; y: number }) => params.x + params.y,
    });

    const calculatorAgent = new FunctionAgent({
      name: "CalculatorAgent",
      description: "Simple calculator",
      tools: [addTool],
      llm: mockLLM,
    });

    const dummyResult: AgentToolCallResult = {
      toolName: "add",
      toolKwargs: { x: 2, y: 2 },
      toolId: "123",
      toolOutput: { result: "4", isError: false, id: "123" },
      returnDirect: false,
      raw: [],
    };

    const workflowData = {
      scratchpad: [],
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await calculatorAgent.handleToolCallResults(workflowData as any, [
      dummyResult,
    ]);

    // Check if agent's scratchpad has been updated with the correct message
    expect(workflowData.scratchpad.length).toEqual(1);
    const message = workflowData.scratchpad[0] as unknown as ChatMessage;
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
});
