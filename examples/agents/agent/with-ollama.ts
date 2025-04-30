import { ollama } from "@llamaindex/ollama";
import { agent } from "@llamaindex/workflow";
import { getWeatherTool } from "../deprecated/utils/tools";

async function main() {
  const myAgent = agent({
    tools: [getWeatherTool],
    verbose: false,
    llm: ollama({ model: "granite3.2:2b" }),
  });

  const sfResult = await myAgent.run(
    "What's the weather like in San Francisco?",
  );
  // The weather in San Francisco, CA is currently sunny.
  console.log(`${JSON.stringify(sfResult, null, 2)}`);

  // Reuse the context from the previous run
  const caResult = await myAgent.run("Compare it with California?");

  // Both San Francisco and California are currently experiencing sunny weather.
  console.log(`${JSON.stringify(caResult, null, 2)}`);
}

main().catch(console.error);
