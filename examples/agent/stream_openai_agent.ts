import { OpenAIAgent } from "@llamaindex/openai";
import { FunctionTool } from "llamaindex";
import { z } from "zod";

// Define a function to sum two numbers
function sumNumbers({ a, b }: { a: number; b: number }) {
  return `${a + b}`;
}

// Define a function to divide two numbers
function divideNumbers({ a, b }: { a: number; b: number }) {
  return `${a / b}`;
}

const sumSchema = z.object({
  a: z.number().describe("The first number"),
  b: z.number().describe("The second number"),
});

const divideSchema = z.object({
  a: z.number().describe("The dividend"),
  b: z.number().describe("The divisor"),
});

async function main() {
  // Create a function tool from the sum function
  const functionTool = FunctionTool.from(sumNumbers, {
    name: "sumNumbers",
    description: "Use this function to sum two numbers",
    parameters: sumSchema,
  });

  // Create a function tool from the divide function
  const functionTool2 = FunctionTool.from(divideNumbers, {
    name: "divideNumbers",
    description: "Use this function to divide two numbers",
    parameters: divideSchema,
  });

  // Create an OpenAIAgent with the function tools
  const agent = new OpenAIAgent({
    tools: [functionTool, functionTool2],
  });

  const stream = await agent.chat({
    message: "Divide 16 by 2 then add 20",
    stream: true,
  });

  console.log("Response:");

  for await (const { delta } of stream) {
    process.stdout.write(delta);
  }
}

void main().then(() => {
  console.log("\nDone");
});
