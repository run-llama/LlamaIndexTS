import { OpenAIAgent } from "../../agent";
import { CallbackManager } from "../../callbacks/CallbackManager";
import { OpenAI } from "../../llm";
import { FunctionTool } from "../../tools";
import { mockLlmToolCallGeneration } from "../utility/mockOpenAI";

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

jest.mock("../../llm/open_ai", () => {
  return {
    getOpenAISession: jest.fn().mockImplementation(() => null),
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
