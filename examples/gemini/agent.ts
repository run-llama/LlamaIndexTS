import { gemini, GEMINI_MODEL } from "@llamaindex/google";
import { agent, tool } from "llamaindex";
import { z } from "zod";

const sumNumbers = tool({
  name: "sumNumbers",
  description: "Use this function to sum two numbers",
  parameters: z.object({
    a: z.number().describe("The first number"),
    b: z.number().describe("The second number"),
  }),
  execute: ({ a, b }) => `${a + b}`,
});

const divideNumbers = tool({
  name: "divideNumbers",
  description: "Use this function to divide two numbers",
  parameters: z.object({
    a: z.number().describe("The dividend a to divide"),
    b: z.number().describe("The divisor b to divide by"),
  }),
  execute: ({ a, b }) => `${a / b}`,
});

const subtractNumbers = tool({
  name: "subtractNumbers",
  description: "Use this function to subtract two numbers",
  parameters: z.object({
    a: z.number().describe("The number to subtract from"),
    b: z.number().describe("The number to subtract"),
  }),
  execute: ({ a, b }) => `${a - b}`,
});

async function main() {
  const myAgent = agent({
    tools: [sumNumbers, divideNumbers, subtractNumbers],
    llm: gemini({ model: GEMINI_MODEL.GEMINI_PRO }),
  });

  const result = await myAgent.run(
    "How much is 5 + 5? then divide by 2 then subtract 1",
  );
  console.log(result.data);
}

void main().then(() => {
  console.log("Done");
});
