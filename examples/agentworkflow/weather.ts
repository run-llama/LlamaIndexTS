import { AgentWorkflow } from "@llamaindex/core/agent";
import { OpenAI } from "@llamaindex/openai";
import { getWeatherTool } from "../agent/utils/tools";

async function main() {
  // Create LLM instance
  const llm = new OpenAI({
    model: "gpt-4o-mini",
  });

  // Create agent workflow with the tool
  const workflow = AgentWorkflow.fromTools([getWeatherTool], {
    llm,
    name: "WeatherAgent",
    systemPrompt: `You are a helpful weather assistant. 
      Use the provided tools to answer questions about the weather, if there are multiple city, call the tool multiple times.`,
    verbose: true,
  });

  // Example queries to ask the agent
  const result = await workflow.run(
    "What's the weather like in San Francisco and New York?",
  );
  console.log(`Result: ${result}`);
}

// Run the example
if (require.main === module) {
  main().catch((error) => {
    console.error("Error:", error);
  });
}
