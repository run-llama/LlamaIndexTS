import { getContext, type WorkflowEventData } from "@llama-flow/core";
import {
  AgentWorkflow,
  startAgentEvent,
  stopAgentEvent,
} from "./agent-workflow";
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
  const emittedEvents = await stream.until(stopAgentEvent).toArray();

  const wasResultEventEmitted = emittedEvents.some((emittedEvent) =>
    results.some((resultEvent) => resultEvent.include(emittedEvent)),
  );

  if (!wasResultEventEmitted) {
    throw new Error(
      "The agent finished without emitting a required result event.",
    );
  }
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
