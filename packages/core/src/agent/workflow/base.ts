import type { HandlerContext, WorkflowEvent } from "@llamaindex/workflow";
import type {
  BaseTool,
  BaseToolWithCall,
  ChatMessage,
  LLM,
  ToolCall,
  ToolResult,
} from "../../llms";
import { BaseMemory } from "../../memory";

/**
 * Represents the output of an agent's step in a workflow
 */
export interface AgentOutput {
  response: ChatMessage;
  toolCalls: ToolCall[]; // More specific type instead of any[]
  raw: unknown; // Using unknown instead of any
  currentAgentName: string;
}

export type AgentWorkflowContext = {
  userInput: string;
  memory: BaseMemory;
  scratchpad: ChatMessage[];
  agents: string[];
  currentAgentName: string;
  nextAgentName?: string | null;
};

/**
 * Represents the result of a tool call
 */
export interface ToolCallResult {
  toolCall: ToolCall;
  toolResult: ToolResult;
  returnDirect: boolean;
}

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
    ctx: HandlerContext<AgentWorkflowContext>,
    llmInput: ChatMessage[],
    tools: BaseToolWithCall[],
    memory: BaseMemory,
  ): Promise<AgentOutput>;

  /**
   * Handle results from tool calls
   */
  handleToolCallResults(
    ctx: HandlerContext<AgentWorkflowContext>,
    results: ToolCallResult[],
    memory: BaseMemory,
  ): Promise<void>;

  /**
   * Finalize the agent's output
   */
  finalize(
    ctx: HandlerContext<AgentWorkflowContext>,
    output: AgentOutput,
    memory: BaseMemory,
  ): Promise<AgentOutput>;
}

/**
 * Output yielded during workflow streaming
 */
export interface AgentWorkflowOutput {
  type: "agentOutput" | "toolCall" | "toolResult" | "completion";
  content?: string;
  tool?: BaseTool;
  arguments?: Record<string, unknown>; // Using unknown instead of any
  result?: unknown; // Using unknown instead of any
  event: WorkflowEvent;
}

/**
 * Parameters for creating an AgentWorkflow
 */
export interface AgentWorkflowParams {
  // Using strict typing for optional properties
  verbose?: boolean;
  timeout?: number;
  validate?: boolean;
}
