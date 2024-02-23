import { OpenAIAgent } from "llamaindex/agent/index";
import { CallbackManager } from "llamaindex/callbacks/CallbackManager";
import { OpenAI } from "llamaindex/llm/index";
import { FunctionTool } from "llamaindex/tools/index";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockLlmToolCallGeneration } from "../utility/mockOpenAI.js";

// Define a function to sum two numbers
function sumNumbers({ a, b }: { a: number; b: number }): number {
  return a + b;
}

const sumJSON = {
  type: "object",
  properties: {
    a: {
      type: "number",
      description: "The first number",
    },
    b: {
      type: "number",
      description: "The second number",
    },
  },
  required: ["a", "b"],
};

vi.mock("llamaindex/llm/open_ai", () => {
  return {
    getOpenAISession: vi.fn().mockImplementation(() => null),
  };
});

describe("OpenAIAgent", () => {
  let openaiAgent: OpenAIAgent;

  beforeEach(() => {
    const callbackManager = new CallbackManager({});

    const languageModel = new OpenAI({
      model: "gpt-3.5-turbo",
      callbackManager,
    });

    mockLlmToolCallGeneration({
      languageModel,
      callbackManager,
    });

    const sumFunctionTool = new FunctionTool(sumNumbers, {
      name: "sumNumbers",
      description: "Use this function to sum two numbers",
      parameters: sumJSON,
    });

    openaiAgent = new OpenAIAgent({
      tools: [sumFunctionTool],
      llm: languageModel,
      verbose: false,
    });
  });

  it("should be able to chat with agent", async () => {
    const response = await openaiAgent.chat({
      message: "how much is 1 + 1?",
    });

    expect(String(response)).toEqual("The sum is 2");
  });
});
