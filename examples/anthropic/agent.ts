import { Anthropic } from "@llamaindex/anthropic";
import { agent, FunctionTool, Settings } from "llamaindex";
import { z } from "zod";
import { WikipediaTool } from "../wiki";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: "claude-3-7-sonnet",
});

Settings.llm = anthropic;

const workflow = agent({
  tools: [
    FunctionTool.from(
      (query) => {
        return `The weather in ${query.location} is sunny`;
      },
      {
        name: "weather",
        description: "Get the weather",
        parameters: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
      },
    ),
    new WikipediaTool(),
  ],
});

async function main() {
  const workflowContext = workflow.run(
    "What is the weather in New York? What's the history of New York from Wikipedia in 3 sentences?",
  );
  const result = await workflowContext;
  console.log(result.data);
}

void main();
