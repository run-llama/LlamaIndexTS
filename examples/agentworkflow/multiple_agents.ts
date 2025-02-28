/**
 * This example shows how to use AgentWorkflow with multiple agents
 * 1. FetchWeatherAgent - Fetches the weather in a city
 * 2. TemperatureConverterAgent - Converts the temperature from Fahrenheit to Celsius
 */
import { OpenAI } from "@llamaindex/openai";
import {
  AgentInput,
  AgentOutput,
  AgentStream,
  AgentToolCall,
  AgentToolCallResult,
  AgentWorkflow,
  FunctionAgent,
  StopEvent,
} from "@llamaindex/workflow";
import { FunctionTool } from "llamaindex";

const llm = new OpenAI({
  model: "gpt-4o-mini",
});

// Define tools for the agents
const temperatureConverterTool = FunctionTool.from(
  ({ temperature }: { temperature: number }) => {
    return ((temperature - 32) * 5) / 9;
  },
  {
    description: "Convert a temperature from Fahrenheit to Celsius",
    name: "fahrenheitToCelsius",
    parameters: {
      type: "object",
      properties: {
        temperature: { type: "number" },
      },
      required: ["temperature"],
    },
  },
);

const temperatureFetcherTool = FunctionTool.from(
  ({ city }: { city: string }) => {
    const temperature = Math.floor(Math.random() * 58) + 32;
    return `The current temperature in ${city} is ${temperature}°F`;
  },
  {
    description: "Fetch the temperature (in Fahrenheit) for a city",
    name: "fetchTemperature",
    parameters: {
      type: "object",
      properties: {
        city: { type: "string" },
      },
      required: ["city"],
    },
  },
);

// Create agents
async function multiWeatherAgent() {
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
  const context = workflow.run(
    "What is the weather in San Francisco in Celsius?",
  );
  // Stream the events
  for await (const event of context) {
    // These events might be useful for UI
    if (
      event instanceof AgentToolCall ||
      event instanceof AgentToolCallResult ||
      event instanceof AgentOutput ||
      event instanceof AgentInput ||
      event instanceof StopEvent
    ) {
      console.log(event);
    } else if (event instanceof AgentStream) {
      for (const chunk of event.data.delta) {
        process.stdout.write(chunk);
      }
    }
  }
}

multiWeatherAgent().catch((error) => {
  console.error("Error:", error);
});
