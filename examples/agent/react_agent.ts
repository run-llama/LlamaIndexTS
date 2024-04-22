import { Anthropic, FunctionTool, ReActAgent } from "llamaindex";

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
  const functionTool = new FunctionTool(sumNumbers, {
    name: "sumNumbers",
    description: "Use this function to sum two numbers",
    parameters: sumJSON,
  });

  // Create a function tool from the divide function
  const functionTool2 = new FunctionTool(divideNumbers, {
    name: "divideNumbers",
    description: "Use this function to divide two numbers",
    parameters: divideJSON,
  });

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-3-opus",
  });

  // Create an ReActAgent with the function tools
  const agent = new ReActAgent({
    llm: anthropic,
    tools: [functionTool, functionTool2],
  });

  // Chat with the agent
  const { response } = await agent.chat({
    message: "Divide 16 by 2 then add 20",
  });

  // Print the response
  console.log(response.message);
}

void main().then(() => {
  console.log("Done");
});
