import type { InferWorkflowEventData, WorkflowContext } from "@llama-flow/core";
import type { JSONObject } from "@llamaindex/core/global";
import { Settings } from "@llamaindex/core/global";
import {
  ToolCallLLM,
  type BaseToolWithCall,
  type ChatMessage,
  type ChatResponseChunk,
} from "@llamaindex/core/llms";
import { BaseMemory } from "@llamaindex/core/memory";
import { AgentWorkflow } from "./agent-workflow";
import { type AgentWorkflowContext, type BaseWorkflowAgent } from "./base";
import {
  AgentOutput,
  AgentStream,
  AgentToolCall,
  AgentToolCallResult,
} from "./events";

const DEFAULT_SYSTEM_PROMPT =
  "You are a helpful assistant. Use the provided tools to answer questions.";

export type FunctionAgentParams = {
  /**
   * Agent name
   */
  name?: string | undefined;
  /**
   * LLM to use for the agent, required.
   */
  llm?: ToolCallLLM | undefined;
  /**
   * Description of the agent, useful for task assignment.
   * Should provide the capabilities or responsibilities of the agent.
   */
  description?: string | undefined;
  /**
   * List of tools that the agent can use, requires at least one tool.
   */
  tools: BaseToolWithCall[];
  /**
   * List of agents that this agent can delegate tasks to
   * Can be a list of agent names as strings, BaseWorkflowAgent instances, or AgentWorkflow instances
   */
  canHandoffTo?: string[] | BaseWorkflowAgent[] | AgentWorkflow[] | undefined;
  /**
   * Custom system prompt for the agent
   */
  systemPrompt?: string | undefined;
};

export class FunctionAgent implements BaseWorkflowAgent {
  readonly name: string;
  readonly systemPrompt: string;
  readonly description: string;
  readonly llm: ToolCallLLM;
  readonly tools: BaseToolWithCall[];
  readonly canHandoffTo: string[];

  constructor({
    name,
    llm,
    description,
    tools,
    canHandoffTo,
    systemPrompt,
  }: FunctionAgentParams) {
    this.name = name ?? "Agent";
    this.llm = llm ?? (Settings.llm as ToolCallLLM);
    if (!this.llm.supportToolCall) {
      throw new Error("FunctionAgent requires an LLM that supports tool calls");
    }
    this.description =
      description ??
      "A single agent that uses the provided tools or functions.";
    this.tools = tools;
    if (tools.length === 0) {
      throw new Error("FunctionAgent must have at least one tool");
    }
    // Process canHandoffTo to extract agent names
    this.canHandoffTo = [];
    if (canHandoffTo) {
      if (Array.isArray(canHandoffTo)) {
        if (canHandoffTo.length > 0) {
          if (typeof canHandoffTo[0] === "string") {
            // string[] case
            this.canHandoffTo = canHandoffTo as string[];
          } else if (canHandoffTo[0] instanceof AgentWorkflow) {
            // AgentWorkflow[] case
            const workflows = canHandoffTo as AgentWorkflow[];
            workflows.forEach((workflow) => {
              const agentNames = workflow
                .getAgents()
                .map((agent) => agent.name);
              this.canHandoffTo.push(...agentNames);
            });
          } else {
            // BaseWorkflowAgent[] case
            const agents = canHandoffTo as BaseWorkflowAgent[];
            this.canHandoffTo = agents.map((agent) => agent.name);
          }
        }
      }
    }
    const uniqueHandoffAgents = new Set(this.canHandoffTo);
    if (uniqueHandoffAgents.size !== this.canHandoffTo.length) {
      throw new Error("Duplicate handoff agents");
    }
    this.systemPrompt = systemPrompt ?? DEFAULT_SYSTEM_PROMPT;
  }

  async takeStep(
    ctx: WorkflowContext,
    data: AgentWorkflowContext,
    llmInput: ChatMessage[],
    tools: BaseToolWithCall[],
  ): Promise<InferWorkflowEventData<typeof AgentOutput>> {
    // Get scratchpad from context or initialize if not present
    const scratchpad: ChatMessage[] = data.scratchpad;
    const currentLLMInput = [...llmInput, ...scratchpad];

    const responseStream = await this.llm.chat({
      messages: currentLLMInput,
      tools,
      stream: true,
    });
    let response = "";
    let lastChunk: ChatResponseChunk | undefined;
    const toolCalls: Map<
      string,
      InferWorkflowEventData<typeof AgentToolCall>
    > = new Map();
    for await (const chunk of responseStream) {
      response += chunk.delta;
      ctx.sendEvent(
        AgentStream.with({
          delta: chunk.delta,
          response: response,
          currentAgentName: this.name,
          raw: chunk.raw,
        }),
      );
      const toolCallsInChunk = this.getToolCallFromResponseChunk(chunk);
      if (toolCallsInChunk.length > 0) {
        // Just upsert the tool calls with the latest one if they exist
        toolCallsInChunk.forEach((toolCall) => {
          toolCalls.set(toolCall.toolId, toolCall);
        });
      }
    }

    const message: ChatMessage = {
      role: "assistant" as const,
      content: response,
    };

    if (toolCalls.size > 0) {
      message.options = {
        toolCall: Array.from(toolCalls.values()).map((toolCall) => ({
          name: toolCall.toolName,
          input: toolCall.toolKwargs,
          id: toolCall.toolId,
        })),
      };
    }
    scratchpad.push(message);
    data.scratchpad = scratchpad;
    return {
      response: message,
      toolCalls: Array.from(toolCalls.values()),
      raw: lastChunk?.raw,
      currentAgentName: this.name,
    };
  }

  async handleToolCallResults(
    ctx: AgentWorkflowContext,
    results: InferWorkflowEventData<typeof AgentToolCallResult>[],
  ): Promise<void> {
    const scratchpad: ChatMessage[] = ctx.scratchpad;

    for (const result of results) {
      const content = result.toolOutput.result;

      const rawToolMessage = {
        role: "user" as const,
        content,
        options: {
          toolResult: {
            id: result.toolId,
            result: content,
            isError: result.toolOutput.isError,
          },
        },
      };
      ctx.scratchpad.push(rawToolMessage);
    }

    ctx.scratchpad = scratchpad;
  }

  async finalize(
    ctx: AgentWorkflowContext,
    output: InferWorkflowEventData<typeof AgentOutput>,
    memory: BaseMemory,
  ): Promise<InferWorkflowEventData<typeof AgentOutput>> {
    // Get scratchpad messages
    const scratchpad: ChatMessage[] = ctx.scratchpad;

    for (const msg of scratchpad) {
      memory.put(msg);
    }

    // Clear scratchpad after finalization
    ctx.scratchpad = [];

    return output;
  }

  private getToolCallFromResponseChunk(
    responseChunk: ChatResponseChunk,
  ): InferWorkflowEventData<typeof AgentToolCall>[] {
    const toolCalls: InferWorkflowEventData<typeof AgentToolCall>[] = [];
    const options = responseChunk.options ?? {};
    if (options && "toolCall" in options && Array.isArray(options.toolCall)) {
      toolCalls.push(
        ...options.toolCall.map((call) => {
          // Convert input to arguments format
          let toolKwargs: JSONObject;
          if (typeof call.input === "string") {
            try {
              toolKwargs = JSON.parse(call.input);
            } catch (e) {
              toolKwargs = { rawInput: call.input };
            }
          } else {
            toolKwargs = call.input as JSONObject;
          }

          return {
            agentName: this.name,
            toolName: call.name,
            toolKwargs: toolKwargs,
            toolId: call.id,
          };
        }),
      );
    }

    const invalidToolCalls = toolCalls.filter(
      (call) =>
        !this.tools.some((tool) => tool.metadata.name === call.toolName),
    );

    if (invalidToolCalls.length > 0) {
      const invalidToolNames = invalidToolCalls
        .map((call) => call.toolName)
        .join(", ");
      throw new Error(`Tools not found: ${invalidToolNames}`);
    }

    return toolCalls;
  }
}
