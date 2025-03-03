import { OpenAI } from "@llamaindex/openai";
import {
  AgentToolCall,
  AgentToolCallResult,
  AgentWorkflow,
  FunctionAgent,
} from "@llamaindex/workflow/agent";
import fs from "fs";
import os from "os";

import { FunctionTool } from "llamaindex";
import { WikipediaTool } from "../wiki";
const llm = new OpenAI({
  model: "gpt-4o-mini",
});

const saveFileTool = FunctionTool.from(
  ({ content }: { content: string }) => {
    const filePath = os.tmpdir() + "/report.md";
    fs.writeFileSync(filePath, content);
    return `File saved successfully at ${filePath}`;
  },
  {
    name: "save_file",
    description:
      "Save the written content into a file that can be downloaded by the user",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string" },
      },
      required: ["content"],
    },
  },
);

async function main() {
  const researchAgent = new FunctionAgent({
    name: "ResearchAgent",
    description:
      "Responsible for gathering relevant information from the internet",
    systemPrompt: `You are a research agent. Your role is to gather information from the internet using the provided tools and then transfer this information to the writer agent for content creation.`,
    tools: [new WikipediaTool()],
    canHandoffTo: ["WriterAgent"],
    llm,
  });

  const reportAgent = new FunctionAgent({
    name: "WriterAgent",
    description:
      "Responsible for crafting well-written blog posts based on research findings",
    systemPrompt: `You are a professional writer. Your task is to create an engaging blog post using the research content provided. Once complete, save the post to a file using the saveFile tool.`,
    tools: [saveFileTool],
    llm,
  });

  const workflow = new AgentWorkflow({
    agents: [researchAgent, reportAgent],
    rootAgent: "ResearchAgent",
  });

  const context = workflow.run("Write a blog post about history of LLM");

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
