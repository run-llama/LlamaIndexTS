/**
 * This example shows how to use AgentWorkflow as a single agent with tools
 */
import { OpenAI } from "@llamaindex/openai";
import { AgentStream, AgentWorkflow, StopEvent } from "@llamaindex/workflow";
import { getWeatherTool } from "../agent/utils/tools";

const llm = new OpenAI({
  model: "gpt-4o-mini",
});

async function singleWeatherAgent() {
  const workflow = AgentWorkflow.fromTools({
    tools: [getWeatherTool],
    llm,
    verbose: false,
  });

  // For non-streaming output, you can just do:
  const result: StopEvent = await workflow.run(
    "What's the weather like in San Francisco and New York?",
  );
  console.log(`Result: ${JSON.stringify(result.data, null, 2)}`);

  // For streaming output, you can do:
  console.log("--------------------------------");
  const resultStream = workflow.run(
    "What's the weather like in San Francisco and New York?",
  );
  for await (const event of resultStream) {
    if (event instanceof AgentStream) {
      if (event.data.delta) {
        process.stdout.write(event.data.delta);
      }
    }
  }
  console.log();
}

singleWeatherAgent().catch((error) => {
  console.error("Error:", error);
});
