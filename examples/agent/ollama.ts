import { FunctionTool, ReActAgent } from "llamaindex";
import { Ollama } from "llamaindex/llm/ollama";

const llm = new Ollama({
  model: "llama3:instruct",
  config: {
    host: "http://localhost:11434",
  },
});

function sumNumbers({ a, b }: { a: number; b: number }) {
  console.log(`sumNumbers called with ${a}, ${b}`);
  return `${a + b}`;
}
const sumJSON = {
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
} as const;

function divideNumbers({ a, b }: { a: number; b: number }) {
  console.log(`divideNumbers called with ${a}, ${b}`);
  return `${a / b}`;
}
const divideJSON = {
  type: "object",
  properties: {
    a: {
      type: "number",
      description: "The dividend",
    },
    b: {
      type: "number",
      description: "The divisor",
    },
  },
  required: ["a", "b"],
} as const;

async function main() {
  const functionTool = new FunctionTool(sumNumbers, {
    name: "sumNumbers",
    description: "Use this function to sum two numbers",
    parameters: sumJSON,
  });

  const functionTool2 = new FunctionTool(divideNumbers, {
    name: "divideNumbers",
    description: "Use this function to divide two numbers",
    parameters: divideJSON,
  });

  const agent = new ReActAgent({
    llm,
    tools: [functionTool, functionTool2],
  });

  const task = await agent.createTask(
    "Divide 16 by 2 then add 20. Finally divide by 4.",
    false,
    true,
  );
  let count = 0;
  for await (const stepOutput of task) {
    console.log(`Runnning step ${count++}`);
    console.log(`======== OUTPUT ==========`);
    console.log(stepOutput);
    console.log(`==========================`);
    if (stepOutput.isLast) {
      console.log("Response: " + JSON.stringify(stepOutput.output));
    }
  }
}

void main().then(() => {
  console.log("Done");
});
