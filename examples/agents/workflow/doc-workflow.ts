import {
  ChatMemoryBuffer,
  ChatMessage,
  MessageContent,
  ToolCallLLM,
} from "llamaindex";

import {
  agent,
  agentStreamEvent,
  createStatefulMiddleware,
  createWorkflow,
  startAgentEvent,
  stopAgentEvent,
  workflowEvent,
  zodEvent,
  type WorkflowEvent,
} from "@llamaindex/workflow";

import { z } from "zod";

export const DocumentRequirementSchema = z.object({
  type: z.enum(["markdown", "html"]),
  title: z.string(),
  requirement: z.string(),
});

export type DocumentRequirement = z.infer<typeof DocumentRequirementSchema>;

export const UIEventSchema = z.object({
  type: z.literal("ui_event"),
  data: z.object({
    state: z
      .enum(["plan", "generate", "completed"])
      .describe(
        "The current state of the workflow: 'plan', 'generate', or 'completed'.",
      ),
    requirement: z
      .string()
      .optional()
      .describe(
        "An optional requirement creating or updating a document, if applicable.",
      ),
  }),
});
export type UIEvent = z.infer<typeof UIEventSchema>;
export const uiEvent = zodEvent(UIEventSchema);

const planEvent = workflowEvent<{
  userInput: MessageContent;
  context?: string | undefined;
}>();

const ArtifactRequirementSchema = z.object({
  type: z
    .literal("markdown")
    .describe("The type of the artifact. Only 'markdown' is allowed."),
  title: z.string().describe("The title of the artifact."),
  requirement: z
    .string()
    .describe("The requirement for the artifact generation."),
});

const generateArtifactEvent = zodEvent(ArtifactRequirementSchema);
const SynthesizeAnswerSchema = z.object({
  requirement: ArtifactRequirementSchema,
  generatedArtifact: z.string(),
});
const synthesizeAnswerEvent = zodEvent(SynthesizeAnswerSchema);

const ArtifactSchema = z.object({
  type: z
    .literal("artifact")
    .describe("Always set to 'artifact' for this event."),
  data: z.object({
    type: z
      .literal("document")
      .describe("Always set to 'document' for this data."),
    data: z.object({
      title: z.string().describe("The title of the data."),
      content: z.string().describe("The content of the data."),
      type: z
        .enum(["markdown", "html"])
        .describe(
          "The type of the data. Only 'markdown' or 'html' is allowed.",
        ),
    }),
  }),
});
export type Artifact = z.infer<typeof ArtifactSchema>;
export const artifactEvent: WorkflowEvent<Artifact> & {
  schema: z.ZodType<Artifact>;
} = zodEvent(ArtifactSchema);

export function createDocumentArtifactWorkflow(
  llm: ToolCallLLM,
  chatHistory: ChatMessage[],
  lastArtifact: Artifact | undefined,
) {
  const { withState, getContext } = createStatefulMiddleware(() => {
    return {
      memory: new ChatMemoryBuffer({
        llm,
        chatHistory: chatHistory,
      }),
      lastArtifact: lastArtifact,
    };
  });
  const workflow = withState(createWorkflow());

  workflow.handle([startAgentEvent], async ({ data: { userInput } }) => {
    // Prepare chat history
    const { state } = getContext();
    // Put user input to the memory
    if (!userInput) {
      throw new Error("Missing user input to start the workflow");
    }
    state.memory.put({
      role: "user",
      content: userInput,
    });
    return planEvent.with({
      userInput,
      context: state.lastArtifact
        ? JSON.stringify(state.lastArtifact)
        : undefined,
    });
  });

  // Generate requirement for artifact
  workflow.handle([planEvent], async (event) => {
    return await agent({
      handlePrompt: `
Your task is analyzing the request and providing requirements for document generation or update.

1. Carefully analyze the conversation history and the user's request to determine what has been done and what the next step should be.
2. From the user's request, provide requirements for the next step of the document generation or update.
`,
      handleEvent: event,
      returnEvent: generateArtifactEvent,
      workflowContext: getContext(),
      llm,
    }).handleWorkflowStep(event);
  });

  // Generate artifact based on the requirement
  workflow.handle([generateArtifactEvent], async (event) => {
    return await agent({
      handlePrompt: `
You are a skilled technical writer who can help users with documentation.
Your task is to generate or update content of a document based on the user's requirement.

Here are the steps to handle this task:
1. Firstly send an ui event with \`generate\` state and the requirement you got from the input to show the requirement to the user.
2. Start generating the content based on the requirement then send artifact event with the document values to show the content to the user.
3. After generating the content, send another ui event with \`completed\` state to update the state to completed.
`,
      handleEvent: event,
      returnEvent: synthesizeAnswerEvent,
      emitEvents: [
        { event: uiEvent, name: "send_ui_event" },
        { event: artifactEvent, name: "send_artifact_event" },
      ],
      workflowContext: getContext(),
      llm,
    }).handleWorkflowStep(event);
  });

  workflow.handle([synthesizeAnswerEvent], async ({ data }) => {
    const { sendEvent } = getContext();
    const { state } = getContext();

    const chatHistory = await state.memory.getMessages();
    const messages = [
      ...chatHistory,
      {
        role: "system" as const,
        content: `
          Your responsibility is to explain the work to the user.
          If there is no document to update, explain the reason.
          If the document is updated, just summarize what changed. Don't need to include the whole document again in the response.
          `,
      },
    ];

    const responseStream = await llm.chat({
      messages,
      stream: true,
    });

    sendEvent(
      uiEvent.with({
        type: "ui_event",
        data: {
          state: "completed",
          requirement: data.requirement.requirement,
        },
      }),
    );

    let response = "";
    for await (const chunk of responseStream) {
      response += chunk.delta;
      sendEvent(
        agentStreamEvent.with({
          delta: chunk.delta,
          response: "",
          currentAgentName: "assistant",
          raw: chunk,
        }),
      );
    }

    return stopAgentEvent.with({
      result: response,
    });
  });

  return workflow;
}
