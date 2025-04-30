import { tool } from "@llamaindex/core/tools";
import { openai } from "@llamaindex/openai";
import {
  agent,
  agentToolCallEvent,
  agentToolCallResultEvent,
  multiAgent,
} from "@llamaindex/workflow";
import fs from "fs";
import os from "os";
import { z } from "zod";

import { wiki } from "@llamaindex/tools";
const llm = openai({
  model: "gpt-4o-mini",
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
  execute: ({ content }: { content: string }) => {
    const filePath = os.tmpdir() + "/report.md";
    fs.writeFileSync(filePath, content);
    return `File saved successfully at ${filePath}`;
  },
});

async function main() {
  const reportAgent = agent({
    name: "ReportAgent",
    description:
      "Responsible for crafting well-written blog posts based on research findings",
    systemPrompt: `You are a professional writer. Your task is to create an engaging blog post using the research content provided. Once complete, save the post to a file using the saveFile tool.`,
    tools: [saveFileTool],
    llm,
  });

  const researchAgent = agent({
    name: "ResearchAgent",
    description:
      "Responsible for gathering relevant information from the internet",
    systemPrompt: `You are a research agent. Your role is to gather information from the internet using the provided tools and then transfer this information to the report agent for content creation.`,
    tools: [wiki()],
    canHandoffTo: [reportAgent],
    llm,
  });

  const workflow = multiAgent({
    agents: [researchAgent, reportAgent],
    rootAgent: researchAgent,
  });

  const events = workflow.runStream("Write a blog post about history of LLM");

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
        `[Tool ${event.data.toolName}] executed with result ${event.data.toolOutput.result}`,
      );
    }
    finalResult = event;
  }
  console.log("Final result:", finalResult?.data);
}

main().catch((error) => {
  console.error("Error:", error);
});
