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

  // Create an OpenAIAgent with the function tools
  const agent = new OpenAIAgent({
    tools: [functionTool, functionTool2],
  });

  // Create a task to sum and divide numbers
  const task = agent.createTask("How much is 5 + 5? then divide by 2");

  let count = 0;

  while (true) {
    const stepOutput = await agent.runStep(task.taskId);

    console.log(`Runnning step ${count++}`);
    console.log(`======== OUTPUT ==========`);
    if (stepOutput.output.response) {
      console.log(stepOutput.output.response);
    } else {
      console.log(stepOutput.output.sources);
    }
    console.log(`==========================`);

    if (stepOutput.isLast) {
      const finalResponse = await agent.finalizeResponse(
        task.taskId,
        stepOutput,
      );
      console.log({ finalResponse });
      break;
    }
  }
}

void main().then(() => {
  console.log("Done");
});
