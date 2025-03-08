import { FunctionTool } from "@llamaindex/core/tools";
import { AgentWorkflow, FunctionAgent } from "@llamaindex/workflow/agent";
import {
  MockLLM,
  Settings,
  ToolCallLLM,
  type JSONObject,
  type LLMChatParamsNonStreaming,
  type LLMChatParamsStreaming,
} from "llamaindex";
import { describe, expect, test, vi } from "vitest";
import { z } from "zod";

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

/**
 * Configure a mock LLM to respond with tool calling responses.
 * This version will first return a tool call, then return a response without tool calls by checking the message history.
 */
function setupToolCallingMockLLM(toolName: string, toolKwargs: unknown) {
  // Reset mocks
  vi.resetAllMocks();

  const mockLLM = new MockLLM({
    responseMessage: "I'll help with that.",
    metadata: {
      model: "mock-model",
      temperature: 0,
      topP: 1,
      contextWindow: 4096,
      tokenizer: undefined,
    },
  });

  let hasCalledTool = false;

  // Override the chat method with our custom implementation
  mockLLM.chat = vi
    .fn()
    .mockImplementation(
      (params: LLMChatParamsStreaming | LLMChatParamsNonStreaming) => {
        // Track if we've already returned a tool call response
        // If we have tool results in the message history, we're in the second round
        const hasToolResult = params.messages.some(
          (msg) =>
            msg.options &&
            typeof msg.options === "object" &&
            "toolResult" in msg.options,
        );

        if (hasToolResult || hasCalledTool) {
          // Second response - just return a normal message without tool calls
          hasCalledTool = false; // Reset for next run

          if (params.stream === true) {
            return Promise.resolve({
              async *[Symbol.asyncIterator]() {
                yield {
                  delta: "Final response",
                  raw: {},
                };
              },
            });
          } else {
            return Promise.resolve({
              message: {
                role: "assistant",
                content: "Final response",
              },
              raw: {},
            });
          }
        } else {
          // First response - return a tool call
          hasCalledTool = true;

          if (params.stream === true) {
            return Promise.resolve({
              async *[Symbol.asyncIterator]() {
                yield {
                  delta: "I'll help with that.",
                  raw: {},
                  options: {
                    toolCall: [
                      {
                        id: "call_123",
                        name: toolName,
                        input: toolKwargs as JSONObject,
                      },
                    ],
                  },
                };
              },
            });
          } else {
            return Promise.resolve({
              message: {
                role: "assistant",
                content: "I'll help with that.",
                options: {
                  toolCall: [
                    {
                      id: "call_123",
                      name: toolName,
                      input: toolKwargs as JSONObject,
                    },
                  ],
                },
              },
              raw: {},
            });
          }
        }
      },
    );

  return mockLLM;
}
