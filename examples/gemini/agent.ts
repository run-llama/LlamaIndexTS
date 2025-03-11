import { gemini, GEMINI_MODEL } from "@llamaindex/google";
import { agent, FunctionTool, Settings } from "llamaindex";
import { z } from "zod";

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

Settings.llm = gemini({
  model: GEMINI_MODEL.GEMINI_PRO,
});

async function main() {
  const workflow = agent({
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
