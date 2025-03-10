import { Settings } from "@llamaindex/core/global";
import { ToolCallLLM } from "@llamaindex/core/llms";
import { FunctionTool } from "@llamaindex/core/tools";
import { MockLLM } from "@llamaindex/core/utils";
import { AgentWorkflow, FunctionAgent } from "@llamaindex/workflow/agent";
import { describe, expect, test, vi } from "vitest";
import { z } from "zod";
import { setupToolCallingMockLLM } from "./mock";

describe("AgentWorkflow", () => {
  test("agent workflow and function agent creation correctly", () => {
    // Create a minimal mock for ToolCallLLM
    const mockLLM = MockLLM as unknown as ToolCallLLM;

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

  test("single agent workflow runs correctly", async () => {
    // This test don't need to handoff
    const mockLLM = setupToolCallingMockLLM("add", { x: 1, y: 2 });

    Settings.llm = mockLLM;

    const addTool = FunctionTool.from(
      (params: { x: number; y: number }) => {
        console.log("addTool called with", params);
        return params.x + params.y;
      },
      {
        name: "add",
        description: "Adds two numbers",
      },
    );

    // Spy on the tool's call method
    vi.spyOn(addTool, "call");

    const workflow = AgentWorkflow.fromTools({
      tools: [addTool],
      llm: mockLLM as unknown as ToolCallLLM,
      verbose: false,
    });

    const result = workflow.run("What is 2 + 2?");

    const events = [];
    for await (const event of result) {
      events.push(event);
    }

    // Validate the specific sequence of events emitted by the workflow
    const expectedEventSequence = [
      "StartEvent",
      "AgentInput",
      "AgentSetup",
      "AgentStepEvent",
      "AgentStream",
      "AgentOutput",
      "ToolCallsEvent",
      "ToolResultsEvent",
      "AgentToolCall",
      "AgentToolCallResult",
      "AgentInput",
      "AgentSetup",
      "AgentStepEvent",
      "AgentStream",
      "AgentOutput",
      "StopEvent",
    ];

    // Check the event sequence - exact types in exact order
    expect(events.map((e) => e.constructor.name)).toEqual(
      expectedEventSequence,
    );

    // Check if addTool is called
    expect(addTool.call).toHaveBeenCalled();

    // Check that we have events
    expect(events.length).toEqual(expectedEventSequence.length);

    //
  });
});
