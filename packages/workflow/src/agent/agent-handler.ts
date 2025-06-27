import { getContext, type WorkflowEventData } from "@llamaindex/workflow-core";
import {
  AgentWorkflow,
  startAgentEvent,
  stopAgentEvent,
} from "./agent-workflow";
import { agentToolCallEvent, type AgentToolCall } from "./events";
import {
  FunctionAgent,
  type StepHandlerParams,
  type ZodEvent,
} from "./function-agent";

async function handleWorkflowStep(
  workflow: AgentWorkflow,
  event: WorkflowEventData<unknown>,
  results: ZodEvent[],
) {
  const agent = workflow.getAgents()[0];
  if (!agent) {
    throw new Error("No valid agent found");
  }

  const { sendEvent, stream } = workflow.createContext();
  sendEvent(
    startAgentEvent.with({
      userInput: "Handle with this input data: " + JSON.stringify(event.data),
    }),
  );

  const agentEvents = await stream.until(stopAgentEvent).toArray();
  checkAgentSentResultEvents(agentEvents, results);
}

/**
 * Create a single agent to handle a workflow step
 * @param params - Parameters for the step handler
 * @returns A new AgentWorkflow instance
 */
function createWorkflowForStepHandler(
  params: StepHandlerParams,
): AgentWorkflow {
  if (!params.workflowContext) {
    throw new Error("workflowContext must be provided");
  }
  if (!params.results) {
    throw new Error("results must have at least one event");
  }
  if (!params.instructions) {
    throw new Error("instructions must be provided");
  }
  const agent = FunctionAgent.fromWorkflowStep({
    workflowContext: params.workflowContext,
    results: params.results,
    events: params.events ?? [],
    instructions: params.instructions,
    tools: params.tools,
    llm: params.llm,
  });
  return new AgentWorkflow({
    agents: [agent],
    rootAgent: agent,
  });
}

/**
 * Add an agent handler to the workflow
 * @param params - Parameters for the agent handler
 * @returns A function that handles a workflow step
 */
export const agentHandler = (
  params: Omit<StepHandlerParams, "workflowContext">,
) => {
  return async (event: WorkflowEventData<unknown>) => {
    const context = getContext();

    const workflow = createWorkflowForStepHandler({
      ...params,
      workflowContext: context,
    });
    await handleWorkflowStep(workflow, event, params.results);
  };
};

/**
 * Check if the agent already sent at least one result event
 * @param agentEvents - Agent workflow events
 * @param results - The result events that the agent should send
 * @returns True if the agent already sent at least one result event or throw an error if the agent finished without sending a result event
 */
const checkAgentSentResultEvents = (
  agentEvents: WorkflowEventData<unknown>[],
  results: ZodEvent[],
) => {
  // We cannot check the result event directly because it's not sent to the agent workflow
  // instead, we check for the tool call event to see if there is a tool call event that match with result events
  const toolCallEvents = agentEvents.filter((event) =>
    agentToolCallEvent.include(event),
  );
  const resultToolNames = new Set(results.map((r) => `send_${r.debugLabel}`));
  for (const toolCallEvent of toolCallEvents) {
    const toolCall = toolCallEvent.data as AgentToolCall;
    if (resultToolNames.has(toolCall.toolName)) {
      return true;
    }
  }
  throw new Error(
    "The agent finished without emitting a required result event.",
  );
};
