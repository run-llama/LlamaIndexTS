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
  model: "gpt-4o",
});

const saveFileTool = FunctionTool.from(
  ({ content }: { content: string }) => {
    const filePath = os.tmpdir() + "/report.md";
    fs.writeFileSync(filePath, content);
    return `File saved successfully at ${filePath}`;
  },
  {
    name: "saveFile",
    description: "Save the provided content to a file",
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
  const wikipediaTool = new WikipediaTool();
  const researchAgent = new FunctionAgent({
    name: "research",
    description: "A research agent that can search the web for information",
    systemPrompt: `You are a research agent, you are with other agents to help user write a blog/report with information from the web.
    Your task is to collect useful information from Wikipedia by using tool and handoff to other agent to write a blog/report.
    `,
    tools: [wikipediaTool],
    canHandoffTo: ["report"],
    llm,
  });

  const reportAgent = new FunctionAgent({
    name: "report",
    description:
      "Can write a file report using the provided information. If there is no research information, i cannot write a report.",
    systemPrompt: `Your responsibility is to write a report in Markdown format using the provided information. 
      If there is no information, tell the user that you cannot write a report.`,
    tools: [saveFileTool],
    llm,
  });

  const workflow = new AgentWorkflow({
    agents: [researchAgent, reportAgent],
    rootAgent: "research",
  });

  const context = workflow.run(
    "Write a report on AI in 2024 and save it to a file",
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
