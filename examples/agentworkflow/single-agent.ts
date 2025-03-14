/**
 * This example shows how to use a single agent with a tool
 */
import { openai } from "@llamaindex/openai";
import { agent } from "llamaindex";
import { getWeatherTool } from "../agent/utils/tools";

async function main() {
  const weatherAgent = agent({
    llm: openai({
      model: "gpt-4o",
    }),
    tools: [getWeatherTool],
    verbose: false,
  });

  // Run the agent and keep the context
  const context = weatherAgent.run("What's the weather like in San Francisco?");
  const result = await context;
  console.log(`${JSON.stringify(result, null, 2)}`);

  // Reuse the context from the previous run
  const caResult = await weatherAgent.run("Compare it with California?", {
    context: context.data,
  });
  console.log(`${JSON.stringify(caResult, null, 2)}`);
}

main().catch((error) => {
  console.error("Error:", error);
});
