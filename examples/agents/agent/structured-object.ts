import { z } from "zod";

import { openai } from "@llamaindex/openai";
import { agent } from "@llamaindex/workflow";
import { tool } from "llamaindex";

const weatherTool = tool({
  name: "weatherTool",
  description: "Get weather information",
  parameters: z.object({
    location: z.string(),
  }),
  execute: ({ location }) => {
    return `The weather in ${location} is sunny. The temperature is 72 degrees. The humidity is 50%. The wind speed is 10 mph.`;
  },
});

const responseSchema = z.object({
  temperature: z.number(),
  humidity: z.number(),
  windSpeed: z.number(),
});

const myAgent = agent({
  name: "myAgent",
  tools: [weatherTool],
  llm: openai(),
});

async function main() {
  const result = await myAgent.run(
    "What's the weather in Tokyo? Respond with a JSON object",
    {
      responseFormat: responseSchema,
    },
  );

  console.log(result.data.object);
  console.log(result.data.result);
}

main().catch(console.error);
