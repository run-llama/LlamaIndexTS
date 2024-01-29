import { FunctionTool, ReActAgent } from "./index";

function sumNumbers({ a, b }: { a: number; b: number }): number {
  return a + b;
}

function divideNumbers({ a, b }: { a: number; b: number }): number {
  return a / b;
}

async function main() {
  const functionTool = new FunctionTool(sumNumbers, {
    name: "sumNumbers",
    description: "Use this function to sum numbers together",
    parameters: {
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
    },
  });

  const functionTool2 = new FunctionTool(divideNumbers, {
    name: "divideNumbers",
    description: "Use this function to divide numbers together",
    parameters: {
      type: "object",
      properties: {
        a: {
          type: "number",
          description: "The argument a to divide",
        },
        b: {
          type: "number",
          description: "The argument b to divide",
        },
      },
      required: ["a", "b"],
    },
  });

  // Create an OpenAIAgent with the function tools
  const worker = new ReActAgent({
    tools: [functionTool, functionTool2],
    verbose: true,
  });

  const response = await worker.chat({
    message: "How much is 5 + 5? then divide by 2",
  });

  console.log(response);
}

main().then(() => {
  console.log("Done");
});
