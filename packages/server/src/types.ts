import { Workflow, type AgentWorkflowContext } from "@llamaindex/workflow";
import type { AgentInputData, AgentWorkflow } from "@llamaindex/workflow/agent";
import type next from "next";

/**
 * ServerWorkflow can be either a custom Workflow or an AgentWorkflow
 */
export type ServerWorkflow =
  | Workflow<AgentWorkflowContext, AgentInputData, string>
  | AgentWorkflow;

/**
 * A factory function that creates a ServerWorkflow instance, possibly asynchronously.
 * The requestBody parameter is the body from the request, which can be used to customize the workflow per request.
 */
export type WorkflowFactory = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestBody?: any,
) => Promise<ServerWorkflow> | ServerWorkflow;

export type NextAppOptions = Parameters<typeof next>[0];

export type LlamaIndexServerOptions = NextAppOptions & {
  workflow: WorkflowFactory;
};
