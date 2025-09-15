import type { JSONObject } from "@llamaindex/core/global";
import type { BaseToolWithCall, ChatMessage, LLM } from "@llamaindex/core/llms";
import { Memory } from "@llamaindex/core/memory";
import type { ZodSchema } from "@llamaindex/core/zod";
import type { WorkflowContext } from "@llamaindex/workflow-core";
import type { AgentOutput, AgentToolCallResult } from "./events";

export type AgentWorkflowState = {
  memory: Memory;
  scratchpad: ChatMessage[];
  agents: string[];
  currentAgentName: string;
  nextAgentName?: string | null;
  responseFormat?: ZodSchema | undefined;
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
   * Take the final response and convert it to a structured output
   */
  getStructuredOutput(
    responseFormat: ZodSchema,
    response: ChatMessage,
  ): Promise<JSONObject>;

  /**
   * Take a single step with the agent
   * Using memory directly to get messages instead of requiring them to be passed in
   */
  takeStep(
    ctx: WorkflowContext,
    state: AgentWorkflowState,
    llmInput: ChatMessage[],
    tools: BaseToolWithCall[],
  ): Promise<AgentOutput>;

  /**
   * Handle results from tool calls
   */
  handleToolCallResults(
    state: AgentWorkflowState,
    results: AgentToolCallResult[],
  ): Promise<void>;

  /**
   * Finalize the agent's output
   */
  finalize(
    state: AgentWorkflowState,
    output: AgentOutput,
  ): Promise<AgentOutput>;
}
