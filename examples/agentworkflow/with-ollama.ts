import { ollama } from "@llamaindex/ollama";
import { agent, Settings } from "llamaindex";
import { getWeatherTool } from "../agent/utils/tools";

Settings.llm = ollama({
  model: "granite3.2:2b",
  config: {
    host: "http://localhost:11434",
  },
});

async function main() {
  const workflow = agent({
    tools: [getWeatherTool],
    verbose: false,
  });

  const workflowContext = workflow.run(
    "What's the weather like in San Francisco?",
  );
  const sfResult = await workflowContext;
  // The weather in San Francisco, CA is currently sunny.
  console.log(`${JSON.stringify(sfResult, null, 2)}`);

  // Reuse the context from the previous run
  const workflowContext2 = workflow.run("Compare it with California?", {
    context: workflowContext.data,
  });
  const caResult = await workflowContext2;
  // Both San Francisco and California are currently experiencing sunny weather.
  console.log(`${JSON.stringify(caResult, null, 2)}`);
}

main().catch(console.error);
