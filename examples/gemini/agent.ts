import { Gemini, GEMINI_MODEL } from "@llamaindex/google";
import { AgentWorkflow, FunctionTool, Settings } from "llamaindex";
import { z } from "zod";

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
    parameters: z.object({
      a: z.number().describe("The first number"),
      b: z.number().describe("The second number"),
    }),
  },
);

const divideNumbers = FunctionTool.from(
  ({ a, b }: { a: number; b: number }) => `${a / b}`,
  {
    name: "divideNumbers",
    description: "Use this function to divide two numbers",
    parameters: z.object({
      a: z.number().describe("The dividend a to divide"),
      b: z.number().describe("The divisor b to divide by"),
    }),
  },
);

const subtractNumbers = FunctionTool.from(
  ({ a, b }: { a: number; b: number }) => `${a - b}`,
  {
    name: "subtractNumbers",
    description: "Use this function to subtract two numbers",
    parameters: z.object({
      a: z.number().describe("The number to subtract from"),
      b: z.number().describe("The number to subtract"),
    }),
  },
);

async function main() {
  const gemini = new Gemini({
    model: GEMINI_MODEL.GEMINI_PRO,
  });

  const workflow = AgentWorkflow.fromTools({
    llm: gemini,
    tools: [sumNumbers, divideNumbers, subtractNumbers],
  });

  const workflowContext = workflow.run(
    "How much is 5 + 5? then divide by 2 then subtract 1",
  );
  const result = await workflowContext;
  console.log(result.data);
}

void main().then(() => {
  console.log("Done");
});
