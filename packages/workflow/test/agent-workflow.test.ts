import { Settings } from "@llamaindex/core/global";
import { FunctionTool } from "@llamaindex/core/tools";
import { MockLLM } from "@llamaindex/core/utils";
import { describe, expect, test, vi } from "vitest";
import { z } from "zod";
import {
  AgentWorkflow,
  FunctionAgent,
  agent,
  agentInputEvent,
  agentOutputEvent,
  agentSetupEvent,
  agentStepEvent,
  agentStreamEvent,
  agentToolCallEvent,
  agentToolCallResultEvent,
  multiAgent,
  startAgentEvent,
  stopAgentEvent,
  toolCallsEvent,
  toolResultsEvent,
} from "../src/agent";
import { setupToolCallingMockLLM } from "./mock";

describe("AgentWorkflow", () => {
  test("agent workflow and function agent creation correctly", () => {
    // Create a proper instance of MockLLM
    const mockLLM = new MockLLM();
    mockLLM.supportToolCall = true;

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
      llm: mockLLM,
      verbose: false,
    });

    const result = workflow.run("What is 2 + 2?");

    const expectedEventSequence = [
      startAgentEvent,
      agentInputEvent,
      agentSetupEvent,
      agentStreamEvent,
      agentStepEvent,
      agentOutputEvent,
      toolCallsEvent,
      agentToolCallEvent,
      agentToolCallResultEvent,
      toolResultsEvent,
      agentInputEvent,
      agentSetupEvent,
      agentStreamEvent,
      agentStepEvent,
      agentOutputEvent,
      stopAgentEvent,
    ];

    // Check the event sequence - exact types in exact order
    let i = 0;
    for await (const event of result) {
      expect(expectedEventSequence[i++].include(event));
    }

    // Check if addTool is called
    expect(addTool.call).toHaveBeenCalled();

    // Check that we have events
    expect(i).toEqual(expectedEventSequence.length);
  });
});

describe("Multiple agents", () => {
  test("multiple agents are set up correctly with handoff capabilities", () => {
    // Create mock LLM
    const mockLLM = new MockLLM();
    mockLLM.supportToolCall = true;

    // Create tools for agents
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

    const subtractTool = FunctionTool.from(
      (params: { x: number; y: number }) => params.x - params.y,
      {
        name: "subtract",
        description: "Subtracts two numbers",
        parameters: z.object({
          x: z.number(),
          y: z.number(),
        }),
      },
    );

    // Create agents using the agent() function
    const addAgent = agent({
      name: "AddAgent",
      description: "Agent that can add numbers",
      tools: [addTool],
      llm: mockLLM,
    });

    const multiplyAgent = agent({
      name: "MultiplyAgent",
      description: "Agent that can multiply numbers",
      tools: [multiplyTool],
      llm: mockLLM,
    });

    const mathAgent = agent({
      name: "MathAgent",
      description: "Agent that can do various math operations",
      tools: [addTool, multiplyTool, subtractTool],
      llm: mockLLM,
      canHandoffTo: ["AddAgent", "MultiplyAgent"],
    });

    // Create workflow with multiple agents using multiAgent
    const workflow = multiAgent({
      agents: [mathAgent, addAgent, multiplyAgent],
      rootAgent: mathAgent,
      verbose: false,
    });

    // Verify agents are set up correctly
    expect(workflow).toBeDefined();
    expect(workflow.getAgents().length).toBe(3);

    // Verify that the mathAgent has a handoff tool
    const mathAgentInstance = workflow
      .getAgents()
      .find((agent) => agent.name === "MathAgent");
    expect(mathAgentInstance).toBeDefined();
    expect(
      mathAgentInstance?.tools.some((tool) => tool.metadata.name === "handOff"),
    ).toBe(true);

    // Verify that addAgent and multiplyAgent don't have handoff tools since they don't handoff to other agents
    const addAgentInstance = workflow
      .getAgents()
      .find((agent) => agent.name === "AddAgent");
    expect(addAgentInstance).toBeDefined();
    expect(
      addAgentInstance?.tools.some((tool) => tool.metadata.name === "handOff"),
    ).toBe(false);

    const multiplyAgentInstance = workflow
      .getAgents()
      .find((agent) => agent.name === "MultiplyAgent");
    expect(multiplyAgentInstance).toBeDefined();
    expect(
      multiplyAgentInstance?.tools.some(
        (tool) => tool.metadata.name === "handOff",
      ),
    ).toBe(false);

    // Verify agent specific tools are preserved
    expect(
      mathAgentInstance?.tools.some(
        (tool) => tool.metadata.name === "subtract",
      ),
    ).toBe(true);
    expect(
      addAgentInstance?.tools.some((tool) => tool.metadata.name === "add"),
    ).toBe(true);
    expect(
      multiplyAgentInstance?.tools.some(
        (tool) => tool.metadata.name === "multiply",
      ),
    ).toBe(true);
  });
});
