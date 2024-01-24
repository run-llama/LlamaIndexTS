import { OpenAIAgent } from "./agent/openai/base";
import { BaseTool, FunctionTool } from "./index";

function sumNumbers({ a, b }: { a: number; b: number }): number {
  return a + b;
}

async function main() {
  const functionTool = new FunctionTool(sumNumbers, {
    name: "sumNumbers",
    description: "Use this function to sum numbers together",
  }) as BaseTool;

  const worker = new OpenAIAgent({
    tools: [functionTool],
    verbose: true,
  });

  const response = await worker.chat({
    message: "How much is 5 + 5?",
  });

  console.log({ response: response });
}

main().then(() => {
  console.log("Done");
});
