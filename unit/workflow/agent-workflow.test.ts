import type { ToolCallLLM } from "@llamaindex/core/llms";
import { FunctionTool } from "@llamaindex/core/tools";
import { AgentWorkflow, FunctionAgent } from "@llamaindex/workflow/agent";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("AgentWorkflow", () => {
  test("agent workflow and function agent creation correctly", () => {
    // Create a minimal mock for ToolCallLLM
    const mockLLM = {} as ToolCallLLM;

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
    const multiplyTool = FunctionTool.from(
      (params: { x: number; y: number }) => params.x * params.y,
      {
        name: "multiply",
        description: "Multiplies two numbers",
        parameters: z.object({
          x: z.number(),
          y: z.number(),
        }),
      },
    );

    // Create function agents
    const calculatorAgent = new FunctionAgent({
      name: "CalculatorAgent",
      description: "Simple calculator",
      tools: [addTool],
      llm: mockLLM,
    });

    const mathAgent = new FunctionAgent({
      name: "MathAgent",
      description: "Performs math operations",
      tools: [addTool, multiplyTool],
      llm: mockLLM,
      canHandoffTo: [calculatorAgent],
    });

    // Verify create single agent workflow
    const singleAgentWorkflow = AgentWorkflow.fromTools({
      tools: [addTool],
      llm: mockLLM,
    });
    expect(singleAgentWorkflow).toBeDefined();

    // Verify workflow initializes correctly with multiple agents
    const workflow = new AgentWorkflow({
      agents: [mathAgent, calculatorAgent],
      rootAgent: mathAgent,
      verbose: false,
    });

    // Verify workflow is defined
    expect(workflow).toBeDefined();

    // Verify adding duplicate agents throws an error
    expect(() => {
      new AgentWorkflow({
        agents: [mathAgent, mathAgent],
        rootAgent: mathAgent,
      });
    }).toThrow();

    // Verify using a non-existent root agent throws an error
    expect(() => {
      new AgentWorkflow({
        agents: [mathAgent],
        rootAgent: calculatorAgent,
      });
    }).toThrow();

    // Expect mathAgent has handOff tools after setup
    expect(
      mathAgent.tools.some((tool) => tool.metadata.name === "handOff"),
    ).toBe(true);
  });
});
