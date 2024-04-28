import { FunctionTool, OpenAIAgent } from "llamaindex";

// Define a function to sum two numbers
function sumNumbers({ a, b }: { a: number; b: number }) {
  return `${a + b}`;
}

// Define a function to divide two numbers
function divideNumbers({ a, b }: { a: number; b: number }) {
  return `${a / b}`;
}

// Define the parameters of the sum function as a JSON schema
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
  // Create a function tool from the sum function
  const functionTool = FunctionTool.from(sumNumbers, {
    name: "sumNumbers",
    description: "Use this function to sum two numbers",
    parameters: sumJSON,
  });

  // Create a function tool from the divide function
  const functionTool2 = FunctionTool.from(divideNumbers, {
    name: "divideNumbers",
    description: "Use this function to divide two numbers",
    parameters: divideJSON,
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

  for await (const {
    response: { delta },
  } of stream) {
    process.stdout.write(delta);
  }
}

void main().then(() => {
  console.log("\nDone");
});
