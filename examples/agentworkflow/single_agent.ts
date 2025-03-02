/**
 * This example shows how to use AgentWorkflow as a single agent with tools
 */
import { OpenAI } from "@llamaindex/openai";
import { AgentWorkflow } from "@llamaindex/workflow";
import { getWeatherTool } from "../agent/utils/tools";

const llm = new OpenAI({
  model: "gpt-4o",
});

async function singleWeatherAgent() {
  const workflow = AgentWorkflow.fromTools({
    tools: [getWeatherTool],
    llm,
    verbose: false,
  });

  const workflowContext = workflow.run({
    user_msg: "What's the weather like in San Francisco?",
  });
  const sfResult = await workflowContext;
  // The weather in San Francisco, CA is currently sunny.
  console.log(`${JSON.stringify(sfResult, null, 2)}`);

  // Reuse the context from the previous run
  const workflowContext2 = workflow.run({
    user_msg: "Compare it with California?",
    context: workflowContext.data,
  });
  const caResult = await workflowContext2;
  // Both San Francisco and California are currently experiencing sunny weather.
  console.log(`${JSON.stringify(caResult, null, 2)}`);
}

singleWeatherAgent().catch((error) => {
  console.error("Error:", error);
});
