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

  const result = await weatherAgent.run(
    "What's the weather like in San Francisco?",
  );
  for await (const event of result) {
    console.log(event.data);
  }
}

main().catch((error) => {
  console.error("Error:", error);
});
