import { z } from "zod";
import { OpenAIAgent } from "./agent/openai/base";
import { FunctionTool } from "./index";

function sumNumbers({ a, b }: { a: number; b: number }): number {
  return a + b;
}

function divideNumbers({ a, b }: { a: number; b: number }): number {
  return a / b;
}

// Definindo o esquema com Zod
const sumArgsSchema = z.object({
  a: z.number(),
  b: z.number(),
});

// Definindo o esquema com Zod
const dividArgsSchema = z.object({
  a: z.number(),
  b: z.number(),
});

async function main() {
  const functionTool = new FunctionTool(sumNumbers, {
    name: "sumNumbers",
    description: "Use this function to sum numbers together",
    parameters: sumArgsSchema,
  });

  const functionTool2 = new FunctionTool(divideNumbers, {
    name: "divideNumbers",
    description: "Use this function to divide numbers together",
    parameters: dividArgsSchema,
  });

  const worker = new OpenAIAgent({
    tools: [functionTool, functionTool2],
    verbose: true,
  });

  const response = await worker.chat({
    message: "How much is 5 + 5? then divide by 2",
  });

  console.log({ response: response.response });

  const response2 = await worker.chat({
    message: "and how much is 20 + 20?",
  });

  console.log({ response: response2.response });
}

main().then(() => {
  console.log("Done");
});
