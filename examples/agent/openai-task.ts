import { ChatResponseChunk, FunctionTool, OpenAIAgent } from "llamaindex";
import { ReadableStream } from "node:stream/web";

const functionTool = FunctionTool.from(
  () => {
    console.log("Getting user id...");
    return crypto.randomUUID();
  },
  {
    name: "get_user_id",
    description: "Get a random user id",
  },
);

const functionTool2 = FunctionTool.from(
  ({ userId }: { userId: string }) => {
    console.log("Getting user info...", userId);
    return `Name: Alex; Address: 1234 Main St, CA; User ID: ${userId}`;
  },
  {
    name: "get_user_info",
    description: "Get user info",
    parameters: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "The user id",
        },
      },
      required: ["userId"],
    },
  },
);

const functionTool3 = FunctionTool.from(
  ({ address }: { address: string }) => {
    console.log("Getting weather...", address);
    return `${address} is in a sunny location!`;
  },
  {
    name: "get_weather",
    description: "Get the current weather for a location",
    parameters: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The address",
        },
      },
      required: ["address"],
    },
  },
);

async function main() {
  // Create an OpenAIAgent with the function tools
  const agent = new OpenAIAgent({
    tools: [functionTool, functionTool2, functionTool3],
  });

  const task = await agent.createTask(
    "What is my current address weather based on my profile?",
    true,
  );

  for await (const stepOutput of task) {
    if (stepOutput.isLast) {
      const stream = stepOutput.output as ReadableStream<ChatResponseChunk>;
      for await (const chunk of stream) {
        process.stdout.write(chunk.delta);
      }
      process.stdout.write("\n");
    } else {
      // handing function call
      console.log("handling function call...");
    }
  }
}

void main().then(() => {
  console.log("Done");
});
