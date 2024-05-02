import { ChatResponseChunk, ReActAgent } from "llamaindex";
import { ReadableStream } from "node:stream/web";
import {
  getCurrentIDTool,
  getUserInfoTool,
  getWeatherTool,
} from "./utils/tools";

async function main() {
  // Create an OpenAIAgent with the function tools
  const agent = new ReActAgent({
    tools: [getCurrentIDTool, getUserInfoTool, getWeatherTool],
  });

  const task = await agent.createTask(
    "What is my current address weather based on my profile?",
    true,
  );

  for await (const stepOutput of task) {
    const stream = stepOutput.output as ReadableStream<ChatResponseChunk>;
    if (stepOutput.isLast) {
      for await (const chunk of stream) {
        process.stdout.write(chunk.delta);
      }
      process.stdout.write("\n");
    } else {
      // handing function call
      console.log("handling function call...");
      for await (const chunk of stream) {
        console.log("debug:", JSON.stringify(chunk.raw));
      }
    }
    console.log("---");
  }
}

void main().then(() => {
  console.log("Done");
});
