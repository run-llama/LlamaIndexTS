import { ToolCallLLM } from "llamaindex";

import {
  agentHandler,
  createWorkflow,
  workflowEvent,
  zodEvent,
} from "@llamaindex/workflow";

import { openai } from "@llamaindex/openai";
import { z } from "zod";

// ===== 1. Define events =====
// An event to trigger the workflow
const planEvent = workflowEvent<{ topic: string }>();

// Generate artifact event
const ArtifactRequirementSchema = z.object({
  type: z.literal("markdown"),
  title: z.string().describe("The title of the artifact."),
  requirement: z
    .string()
    .describe("The requirement for the artifact generation."),
});

const generateArtifactEvent = zodEvent(ArtifactRequirementSchema, {
  debugLabel: "generateArtifactEvent",
});

// Artifact output event
const ArtifactSchema = z.object({
  type: z.literal("artifact"),
  data: z.object({
    type: z.literal("document"),
    data: z.object({
      title: z.string().describe("The title of the data."),
      content: z.string().describe("The content of the data."),
      type: z.enum(["markdown", "html"]).describe("The type of the data."),
    }),
  }),
});
const outputArtifactEvent = zodEvent(ArtifactSchema, {
  debugLabel: "outputArtifactEvent",
});

// Events for updating UI
// assume that we have a UI that can render different states of the workflow
// and update the UI based on the state and the requirement
export const UIEventSchema = z.object({
  type: z.literal("ui_event"),
  data: z.object({
    state: z
      .enum(["plan", "generate", "completed"])
      .describe("The current state of the workflow."),
    requirement: z
      .string()
      .optional()
      .describe(
        "An optional requirement creating or updating a document, if applicable.",
      ),
  }),
});
const uiEvent = zodEvent(UIEventSchema, { debugLabel: "uiEvent" });

// ===== 2. Define workflow with agents using natural language =====
// We have a document artifact workflow that made up of 2 steps:
// 1. Generate requirement for the document
// 2. Generate document content based on the requirement
export function createDocumentArtifactWorkflow(llm: ToolCallLLM) {
  const workflow = createWorkflow();

  // Generate requirement for the document
  workflow.handle(
    [planEvent],
    agentHandler({
      instructions: `
Your task is to analyze the request and provide requirements for document generation or update.
1. Send an uiEvent with the \`plan\` to show UI what you are going to do.
2. Analyze the conversation history and the user's request carefully to determine the completed tasks and the next steps.
3. Return the generateArtifactEvent with the requirement for the next step of the document generation or update.
`,
      results: [generateArtifactEvent],
      events: [uiEvent],
      llm,
    }),
  );

  // Generate document content based on the requirement
  workflow.handle(
    [generateArtifactEvent],
    agentHandler({
      instructions: `
You are a skilled technical writer who can assist users with documentation.
Your task is to generate document content based on the requirement and update the UI state.

Here are the steps to handle this task:
1. First, send an uiEvent with the \`generate\` state and the requirement you received from the input.
2. Next, start generating the content based on the requirement then send an uiEvent with the \`completed\` state to update the state.
3. Finally, return the outputArtifactEvent with the document values.
`,
      results: [outputArtifactEvent],
      events: [uiEvent],
      llm,
    }),
  );

  return workflow;
}

async function main() {
  const llm = openai({ model: "gpt-4.1-mini" });
  const workflow = createDocumentArtifactWorkflow(llm);
  const { stream, sendEvent } = workflow.createContext();

  // Ask the workflow to generate a document about `llama`
  sendEvent(planEvent.with({ topic: "llama" }));

  await stream.until(outputArtifactEvent).forEach((event) => {
    if (planEvent.include(event)) {
      console.log("Starting workflow: ", event.data);
    }
    if (uiEvent.include(event)) {
      console.log("UI event: ", event.data);
    } else if (outputArtifactEvent.include(event)) {
      console.log("Output artifact event: ", event.data);
    }
  });
}

main();
