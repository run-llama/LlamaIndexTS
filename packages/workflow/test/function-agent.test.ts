import { ChatMessage } from "@llamaindex/core/llms";
import { MockLLM } from "@llamaindex/core/llms/mock";
import { tool } from "@llamaindex/core/tools";
import { type WorkflowContext } from "@llamaindex/workflow-core";
import { zodEvent } from "@llamaindex/workflow-core/util/zod";
import { describe, expect, test, vi } from "vitest";
import { z as zod } from "zod";
import * as z from "zod/v4";
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

  test("should be initialized with correct tools", () => {
    // Mock WorkflowContext
    const mockWorkflowContext = {
      sendEvent: vi.fn(),
    } as unknown as WorkflowContext;

    // Create a regular tool
    const addTool = tool({
      name: "add",
      description: "Adds two numbers",
      parameters: z.object({
        x: z.number(),
        y: z.number(),
      }),
      execute: (params: { x: number; y: number }) => params.x + params.y,
    });

    // Create a result event
    const resultEvent = zodEvent(
      zod.object({
        value: zod.string(),
      }),
      {
        debugLabel: "my_result_event",
      },
    );

    // Create an additional event
    const additionalEvent = zodEvent(
      zod.object({
        value: zod.number(),
      }),
      {
        debugLabel: "additional_event",
      },
    );

    // Create the FunctionAgent using fromWorkflowStep
    const agent = FunctionAgent.fromWorkflowStep({
      workflowContext: mockWorkflowContext,
      results: [resultEvent],
      events: [additionalEvent],
      instructions: "Test instructions",
      tools: [addTool],
      llm: mockLLM,
    });

    // Check if the agent is created
    expect(agent).toBeInstanceOf(FunctionAgent);

    // Check the number of tools
    expect(agent.tools.length).toBe(3);

    // Check the names of the tools
    const toolNames = agent.tools.map((t) => t.metadata.name);
    expect(toolNames).toContain("add");
    expect(toolNames).toContain("send_my_result_event");
    expect(toolNames).toContain("send_additional_event");
  });
});
