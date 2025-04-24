import { OpenAI } from "@llamaindex/openai";
import { extractLastArtifact, LlamaIndexServer } from "@llamaindex/server";
import {
  codeArtifactGenerator,
  documentArtifactGenerator,
} from "@llamaindex/tools";
import "dotenv/config";
import { agent } from "llamaindex";

const llm = new OpenAI({ model: "gpt-4o-mini" });

const workflowFactory = (reqBody: unknown) => {
  return agent({
    tools: [
      // if `lastArtifact` is specified, codeArtifactGenerator is using it as previous version for code generation.
      codeArtifactGenerator({
        llm,
        lastArtifact: extractLastArtifact(reqBody, "code"),
      }),
      // if `lastArtifact` is specified, documentArtifactGenerator is using it as previous version for document generation.
      documentArtifactGenerator({
        llm,
        lastArtifact: extractLastArtifact(reqBody, "document"),
      }),
    ],
    llm,
    systemPrompt: `You are a helpful assistant that generates code artifacts or document artifacts based on the user's request. Do NOT include installation instructions in the response. Please add a short summary about the artifact, don't include any other text or repeat the code or document`,
  });
};

new LlamaIndexServer({
  workflow: workflowFactory,
  uiConfig: {
    appTitle: "Artifact Generator",
    starterQuestions: [
      "Generate a simple calculator in nextjs",
      "Write binary search algorithm in python",
      "Create a markdown document about using nextjs",
      "Write an essay about LLMs",
    ],
  },
  port: 4000,
}).start();
