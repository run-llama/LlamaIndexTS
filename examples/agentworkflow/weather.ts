import { AgentWorkflow, FunctionAgent } from "@llamaindex/core/agent";
import { OpenAI } from "@llamaindex/openai";
import { FunctionTool, JSONValue } from "llamaindex";
import { getWeatherTool } from "../agent/utils/tools";

const llm = new OpenAI({
  model: "gpt-4o-mini",
});

async function singleWeatherAgent() {
  // Create an agent workflow with a single agent that has a tool to get the weather
  const workflow = AgentWorkflow.fromTools({
    tools: [getWeatherTool],
    llm,
    verbose: false,
  });

  // Example queries to ask the agent
  const result = await workflow.run(
    "What's the weather like in San Francisco and New York?",
  );
  console.log(`Result: ${JSON.stringify(result, null, 2)}`);
}

const fahrenheitToCelsius = ({
  temperature,
}: {
  temperature: number;
}): JSONValue => {
  return ((temperature - 32) * 5) / 9;
};

const fetchTemperature = async ({
  city,
}: {
  city: string;
}): Promise<JSONValue> => {
  // Randomly return a temperature between 32 and 90
  const temperature = Math.floor(Math.random() * 58) + 32;
  return `The current temperature in ${city} is ${temperature}°F`;
};

async function multiWeatherAgent() {
  // Define custom tools
  const temperatureConverterTool = FunctionTool.from(fahrenheitToCelsius, {
    description: "Convert a temperature from Fahrenheit to Celsius",
    name: "fahrenheitToCelsius",
    parameters: {
      type: "object",
      properties: {
        temperature: { type: "number" },
      },
      required: ["temperature"],
    },
  });

  const temperatureFetcherTool = FunctionTool.from(fetchTemperature, {
    description: "Fetch the temperature (in Fahrenheit) for a city",
    name: "fetchTemperature",
    parameters: {
      type: "object",
      properties: {
        city: { type: "string" },
      },
      required: ["city"],
    },
  });

  // Create agent with appropriate tools
  const weatherAgent = new FunctionAgent({
    name: "FetchWeatherAgent",
    description: "An agent that can get the weather in a city. ",
    systemPrompt:
      "If you can't answer the user question, hand off to other agents.",
    tools: [temperatureFetcherTool],
    llm,
    canHandoffTo: ["TemperatureConverterAgent"],
  });

  const converterAgent = new FunctionAgent({
    name: "TemperatureConverterAgent",
    description:
      "An agent that can convert temperatures from Fahrenheit to Celsius.",
    tools: [temperatureConverterTool],
    llm,
  });

  // Create agent workflow with the agents
  const workflow = new AgentWorkflow({
    agents: [weatherAgent, converterAgent],
    rootAgent: "FetchWeatherAgent",
    verbose: false,
  });

  // Ask the agent to get the weather in a city
  const result = await workflow.run(
    "What is the weather in San Francisco in Celsius?",
  );
  console.log(`Result: ${JSON.stringify(result, null, 2)}`);
}

async function main() {
  await singleWeatherAgent();
  console.log("--------------------------------");
  await multiWeatherAgent();
}

// Run the example
if (require.main === module) {
  main().catch((error) => {
    console.error("Error:", error);
  });
}
