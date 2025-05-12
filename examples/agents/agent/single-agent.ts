/**
 * This example shows how to use a single agent with a tool
 */
import { openai } from "@llamaindex/openai";
import { agent } from "@llamaindex/workflow";
import { getWeatherTool } from "../../deprecated/agents/utils/tools";

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
  console.log(`${JSON.stringify(result, null, 2)}`);

  // Reuse the state from the previous run
  const caResult = await weatherAgent.run("Compare it with California?", {
    state: result.data.state,
  });
  console.log(`${JSON.stringify(caResult, null, 2)}`);
}

main().catch((error) => {
  console.error("Error:", error);
});
