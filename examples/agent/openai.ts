import { z } from "zod";

import { FunctionTool, OpenAIAgent } from "llamaindex";

// Define a function to sum two numbers
function sumNumbers({ a, b }: { a: number; b: number }): number {
  return a + b;
}

// Define a function to divide two numbers
function divideNumbers({ a, b }: { a: number; b: number }): number {
  return a / b;
}

// Define the parameters of the sum function as a JSON schema
const sumJSON = {
  type: "object",
  properties: {
    a: {
      type: "number",
      description: "The argument a to sum",
    },
    b: {
      type: "number",
      description: "The argument b to sum",
    },
  },
  required: ["a", "b"],
};

// Define the parameters of the divide function as a Zod schema
const dividArgsSchema = z
  .object({
    a: z.number().describe("The argument a to divide"),
    b: z.number().describe("The argument b to divide"),
  })
  .describe("the arguments");

async function main() {
  // Create a function tool from the sum function
  const functionTool = new FunctionTool(sumNumbers, {
    name: "sumNumbers",
    description: "Use this function to sum numbers together",
    parameters: sumJSON,
  });

  // Create a function tool from the divide function
  const functionTool2 = new FunctionTool(divideNumbers, {
    name: "divideNumbers",
    description: "Use this function to divide numbers together",
    parameters: dividArgsSchema,
  });

  // Create an OpenAIAgent with the function tools
  const worker = new OpenAIAgent({
    tools: [functionTool, functionTool2],
    verbose: true,
  });

  // Chat with the agent
  const response = await worker.chat({
    message: "How much is 5 + 5? then divide by 2",
  });

  // Print the response
  console.log(String(response));
}

main().then(() => {
  console.log("Done");
});
