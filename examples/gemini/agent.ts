import { Gemini, GEMINI_MODEL } from "@llamaindex/google";
import { FunctionTool, LLMAgent, Settings } from "llamaindex";

Settings.callbackManager.on("llm-tool-call", (event) => {
  console.log(event.detail);
});

Settings.callbackManager.on("llm-tool-result", (event) => {
  console.log(event.detail);
});

const sumNumbers = FunctionTool.from(
  ({ a, b }: { a: number; b: number }) => `${a + b}`,
  {
    name: "sumNumbers",
    description: "Use this function to sum two numbers",
    parameters: {
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
    },
  },
);

const divideNumbers = FunctionTool.from(
  ({ a, b }: { a: number; b: number }) => `${a / b}`,
  {
    name: "divideNumbers",
    description: "Use this function to divide two numbers",
    parameters: {
      type: "object",
      properties: {
        a: {
          type: "number",
          description: "The dividend a to divide",
        },
        b: {
          type: "number",
          description: "The divisor b to divide by",
        },
      },
      required: ["a", "b"],
    },
  },
);

const subtractNumbers = FunctionTool.from(
  ({ a, b }: { a: number; b: number }) => `${a - b}`,
  {
    name: "subtractNumbers",
    description: "Use this function to subtract two numbers",
    parameters: {
      type: "object",
      properties: {
        a: {
          type: "number",
          description: "The number to subtract from",
        },
        b: {
          type: "number",
          description: "The number to subtract",
        },
      },
      required: ["a", "b"],
    },
  },
);

async function main() {
  const gemini = new Gemini({
    model: GEMINI_MODEL.GEMINI_PRO,
  });
  const agent = new LLMAgent({
    llm: gemini,
    tools: [sumNumbers, divideNumbers, subtractNumbers],
  });

  const response = await agent.chat({
    message: "How much is 5 + 5? then divide by 2 then subtract 1",
  });

  console.log(response.message);
}

void main().then(() => {
  console.log("Done");
});
