import type { InferWorkflowEventData, WorkflowContext } from "@llama-flow/core";
import type { BaseToolWithCall, ChatMessage, LLM } from "@llamaindex/core/llms";
import { BaseMemory } from "@llamaindex/core/memory";
import type { AgentOutput, AgentToolCallResult } from "./events";

export type AgentWorkflowContext = {
  userInput: string;
  memory: BaseMemory;
  scratchpad: ChatMessage[];
  agents: string[];
  currentAgentName: string;
  nextAgentName?: string | null;
};

/**
 * Base interface for workflow agents
 */
export interface BaseWorkflowAgent {
  readonly name: string;
  readonly systemPrompt: string;
  readonly description: string;
  readonly tools: BaseToolWithCall[];
  readonly llm: LLM;
  readonly canHandoffTo: string[];

  /**
   * Take a single step with the agent
   * Using memory directly to get messages instead of requiring them to be passed in
   */
  takeStep(
    ctx: WorkflowContext,
    data: AgentWorkflowContext,
    llmInput: ChatMessage[],
    tools: BaseToolWithCall[],
  ): Promise<InferWorkflowEventData<typeof AgentOutput>>;

  /**
   * Handle results from tool calls
   */
  handleToolCallResults(
    ctx: AgentWorkflowContext,
    results: InferWorkflowEventData<typeof AgentToolCallResult>[],
  ): Promise<void>;

  /**
   * Finalize the agent's output
   */
  finalize(
    ctx: AgentWorkflowContext,
    output: InferWorkflowEventData<typeof AgentOutput>,
    memory: BaseMemory,
  ): Promise<InferWorkflowEventData<typeof AgentOutput>>;
}
