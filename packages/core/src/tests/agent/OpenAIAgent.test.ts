import { OpenAIAgent } from "../../agent";
import { CallbackManager } from "../../callbacks/CallbackManager";
import { OpenAI } from "../../llm";
import { FunctionTool } from "../../tools";
import { mockLlmToolCallGeneration } from "../utility/mockOpenAI";

import { z } from "zod";

// Define a function to sum two numbers
function sumNumbers({ a, b }: { a: number; b: number }): number {
  return a + b;
}

const sumArgsSchema = z
  .object({
    a: z.number().describe("The argument a to divide"),
    b: z.number().describe("The argument b to divide"),
  })
  .describe("the arguments");

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
      description: "Use this function to sum numbers together",
      parameters: sumArgsSchema,
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

    expect(response.sources.length).toEqual(1);

    expect(response.sources[0].content).toEqual(2);
    expect(response.sources[0].rawOutput).toEqual(2);
    expect(response.sources[0].rawInput).toEqual({ a: 1, b: 1 });
  });
});
