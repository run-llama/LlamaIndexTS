/**
 * This example shows how to use AgentWorkflow with multiple agents
 * 1. FetchWeatherAgent - Fetches the weather in a city
 * 2. TemperatureConverterAgent - Converts the temperature from Fahrenheit to Celsius
 */
import { openai } from "@llamaindex/openai";
import {
  agent,
  agentInputEvent,
  agentOutputEvent,
  agentStreamEvent,
  agentToolCallEvent,
  agentToolCallResultEvent,
  multiAgent,
  stopAgentEvent,
} from "@llamaindex/workflow";
import { tool } from "llamaindex";
import { z } from "zod";

const llm = openai({
  model: "gpt-4o-mini",
});

// Define tools for the agents
const temperatureConverterTool = tool({
  description: "Convert a temperature from Fahrenheit to Celsius",
  name: "fahrenheitToCelsius",
  parameters: z.object({
    temperature: z.number({
      description: "The temperature in Fahrenheit",
    }),
  }),
  execute: ({ temperature }) => {
    return ((temperature - 32) * 5) / 9;
  },
});

const temperatureFetcherTool = tool({
  description: "Fetch the temperature (in Fahrenheit) for a city",
  name: "fetchTemperature",
  parameters: z.object({
    city: z.string({
      description: "The city to fetch the temperature for",
    }),
  }),
  execute: ({ city }) => {
    const temperature = Math.floor(Math.random() * 58) + 32;
    return `The current temperature in ${city} is ${temperature}°F`;
  },
});

// Create agents
async function multiWeatherAgent() {
  const converterAgent = agent({
    name: "TemperatureConverterAgent",
    description:
      "An agent that can convert temperatures from Fahrenheit to Celsius.",
    tools: [temperatureConverterTool],
    llm,
  });

  const weatherAgent = agent({
    name: "FetchWeatherAgent",
    description: "An agent that can get the weather in a city. ",
    systemPrompt:
      "If you can't answer the user question, hand off to other agents.",
    tools: [temperatureFetcherTool],
    llm,
    // Define which next agents can be called next if this agent cannot complete the task
    // Can be passed as agent name, e.g. "TemperatureConverterAgent"
    canHandoffTo: [converterAgent],
  });

  // Create agent workflow with the agents
  const workflow = multiAgent({
    agents: [weatherAgent, converterAgent],
    rootAgent: weatherAgent,
    verbose: false,
  });

  // Ask the agent to get the weather in a city
  const events = workflow.runStream(
    "What is the weather in San Francisco in Celsius?",
  );
  // Stream the events
  for await (const event of events) {
    // These events are useful for reporting the current state to the user in the UI
    if (
      agentToolCallEvent.include(event) ||
      agentToolCallResultEvent.include(event) ||
      agentOutputEvent.include(event) ||
      agentInputEvent.include(event) ||
      stopAgentEvent.include(event)
    ) {
      console.log(event.data);
    } else if (agentStreamEvent.include(event)) {
      for (const chunk of event.data.delta) {
        process.stdout.write(chunk);
      }
    }
  }
}

multiWeatherAgent().catch((error) => {
  console.error("Error:", error);
});
