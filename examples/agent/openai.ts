import { OpenAI } from "@llamaindex/openai";
import { AgentWorkflow, FunctionTool } from "llamaindex";
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

async function main() {
  const workflow = AgentWorkflow.fromTools({
    tools: [sumNumbers, divideNumbers],
    llm: new OpenAI({ model: "gpt-4o-mini" }),
    verbose: false,
  });

  const response = await workflow.run("How much is 5 + 5? then divide by 2");
  console.log(response.data);
}

void main().then(() => {
  console.log("Done");
});
