import fs from "fs";
import {
  agent,
  AgentToolCall,
  AgentToolCallResult,
  FunctionTool,
  multiAgent,
} from "llamaindex";
import { z } from "zod";

import { Anthropic } from "@llamaindex/anthropic";

const llm = new Anthropic({
  model: "claude-3-5-sonnet",
});

const weatherTool = FunctionTool.from(
  (query: { location: string }) => {
    return `The weather in ${query.location} is sunny`;
  },
  {
    name: "weather",
    description: "Get the weather",
    parameters: z.object({
      location: z.string({
        description: "The location to get the weather for",
      }),
    }),
  },
);

const inflationTool = FunctionTool.from(
  (query: { location: string }) => {
    return `The inflation in ${query.location} is 2%`;
  },
  {
    name: "inflation",
    description: "Get the inflation",
    parameters: z.object({
      location: z.string({
        description: "The location to get the inflation for",
      }),
    }),
  },
);

const saveFileTool = FunctionTool.from(
  ({ content }: { content: string }) => {
    const filePath = "./report.md";
    fs.writeFileSync(filePath, content);
    return `File saved successfully at ${filePath}`;
  },
  {
    name: "saveFile",
    description:
      "Save the written content into a file that can be downloaded by the user",
    parameters: z.object({
      content: z.string({
        description: "The content to save into a file",
      }),
    }),
  },
);

async function main() {
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

  const context = workflow.run(
    "Write a report about New York weather and inflation",
  );

  let finalResult;
  for await (const event of context) {
    if (event instanceof AgentToolCall) {
      console.log(
        `[Agent ${event.displayName}] executing tool ${event.data.toolName} with parameters ${JSON.stringify(
          event.data.toolKwargs,
        )}`,
      );
    } else if (event instanceof AgentToolCallResult) {
      console.log(
        `[Agent ${event.displayName}] executed tool ${event.data.toolName} with result ${event.data.toolOutput.result}`,
      );
    }
    finalResult = event;
  }
  console.log("Final result:", finalResult?.data);
}

main().catch((error) => {
  console.error("Error:", error);
});
