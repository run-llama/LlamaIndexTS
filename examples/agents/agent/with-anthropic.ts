import {
  agent,
  agentToolCallEvent,
  agentToolCallResultEvent,
  multiAgent,
} from "@llamaindex/workflow";
import fs from "fs";
import { tool } from "llamaindex";
import { z } from "zod";

import { anthropic } from "@llamaindex/anthropic";

const weatherTool = tool({
  name: "weather",
  description: "Get the weather",
  parameters: z.object({
    location: z.string({
      description: "The location to get the weather for",
    }),
  }),
  execute: ({ location }) => {
    return `The weather in ${location} is sunny`;
  },
});

const inflationTool = tool({
  name: "inflation",
  description: "Get the inflation",
  parameters: z.object({
    location: z.string({
      description: "The location to get the inflation for",
    }),
  }),
  execute: ({ location }) => {
    return `The inflation in ${location} is 2%`;
  },
});

const saveFileTool = tool({
  name: "saveFile",
  description:
    "Save the written content into a file that can be downloaded by the user",
  parameters: z.object({
    content: z.string({
      description: "The content to save into a file",
    }),
  }),
  execute: ({ content }) => {
    const filePath = "./report.md";
    fs.writeFileSync(filePath, content);
    return `File saved successfully at ${filePath}`;
  },
});

async function main() {
  const llm = anthropic({
    model: "claude-3-5-sonnet",
  });

  const reportAgent = agent({
    name: "ReportAgent",
    description:
      "Responsible for creating concise reports about weather and inflation data",
    systemPrompt: `You are a professional writer. Your task is to create a clear and concise report summarizing the weather and inflation data provided. Once complete, save the report to a file using the saveFile tool.`,
    tools: [saveFileTool],
    llm,
  });

  const researchAgent = agent({
    name: "ResearchAgent",
    description:
      "Responsible for gathering relevant information from the internet",
    systemPrompt: `You are a research agent. Your role is to gather information about the inflation and weather in the location provided.`,
    tools: [inflationTool, weatherTool],
    canHandoffTo: [reportAgent],
    llm,
  });

  const workflow = multiAgent({
    agents: [researchAgent, reportAgent],
    rootAgent: researchAgent,
  });

  const events = workflow.runStream(
    "Write a report about New York weather and inflation",
  );

  let finalResult;
  for await (const event of events) {
    if (agentToolCallEvent.include(event)) {
      console.log(
        `[Agent ${event.data.agentName}] executing tool ${event.data.toolName} with parameters ${JSON.stringify(
          event.data.toolKwargs,
        )}`,
      );
    } else if (agentToolCallResultEvent.include(event)) {
      console.log(
        `[Agent executed tool ${event.data.toolName} with result ${event.data.toolOutput.result}`,
      );
    }
    finalResult = event;
  }
  console.log("Final result:", finalResult?.data);
}

main().catch((error) => {
  console.error("Error:", error);
});
