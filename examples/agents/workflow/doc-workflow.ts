import {
  ChatMemoryBuffer,
  ChatMessage,
  MessageContent,
  ToolCallLLM,
} from "llamaindex";

import {
  addHandler,
  agentStreamEvent,
  createStatefulMiddleware,
  createWorkflow,
  startAgentEvent,
  stopAgentEvent,
  workflowEvent,
  zodEvent,
  type WorkflowEvent,
} from "@llamaindex/workflow";

import { openai } from "@llamaindex/openai";
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
      .describe("The current state of the workflow."),
    requirement: z
      .string()
      .optional()
      .describe(
        "An optional requirement creating or updating a document, if applicable.",
      ),
  }),
});
export type UIEvent = z.infer<typeof UIEventSchema>;
const uiEvent = zodEvent(UIEventSchema);

const planEvent = workflowEvent<{
  userInput: MessageContent;
  context?: string | undefined;
}>();

const ArtifactRequirementSchema = z.object({
  type: z.literal("markdown"),
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
  workflow.handle(
    [planEvent],
    addHandler({
      instructions: `
Your task is to analyze the request and provide requirements for document generation or update.

1. Analyze the conversation history and the user's request carefully to determine the completed tasks and the next steps.
2. Provide the requirements for the next step of the document generation or update based on the user's request.
`,
      result: generateArtifactEvent,
      llm,
    }),
  );

  // Generate artifact based on the requirement
  workflow.handle(
    [generateArtifactEvent],
    addHandler({
      instructions: `
You are a skilled technical writer who can assist users with documentation.
Your task is to generate or update the content of a document based on the user's requirement.

Here are the steps to handle this task:
1. First, send a ui event with the \`generate\` state and the requirement you received from the input to show the requirement to the user.
2. Next, start generating the content based on the requirement, and then send an artifact event with the document values to show the content to the user.
3. After generating the content, send another ui event with the \`completed\` state to update the state to completed.
`,
      result: synthesizeAnswerEvent,
      events: [
        { event: uiEvent, name: "send_ui_event" }, // TBD: Should we add description to the emit events?
        { event: artifactEvent, name: "send_artifact_event" },
      ],
      llm,
    }),
  );

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

async function main() {
  const llm = openai({ model: "gpt-4.1-mini" });
  const workflow = createDocumentArtifactWorkflow(llm, [], undefined);
  const { stream, sendEvent } = workflow.createContext();
  // Ask the workflow to generate a document about `llama`
  sendEvent(startAgentEvent.with({ userInput: "llama" }));

  // Show ui event and artifact event
  for await (const event of stream) {
    if (uiEvent.include(event)) {
      console.log(event.data);
    } else if (artifactEvent.include(event)) {
      console.log(event.data);
    }
  }
}

main();
