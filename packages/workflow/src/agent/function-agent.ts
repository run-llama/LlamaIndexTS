import type { JSONObject } from "@llamaindex/core/global";
import type {
  BaseToolWithCall,
  ChatMessage,
  LLM,
  ToolCall,
} from "@llamaindex/core/llms";
import { BaseMemory } from "@llamaindex/core/memory";
import { stringifyJSONToMessageContent } from "@llamaindex/core/utils";
import type { HandlerContext } from "../workflow-context";
import {
  type AgentWorkflowContext,
  type BaseWorkflowAgent,
  type ToolCallResult,
} from "./base";
import { AgentOutput } from "./events";

const DEFAULT_SYSTEM_PROMPT =
  "You are a helpful assistant. Use the provided tools to answer questions.";

export class FunctionAgent implements BaseWorkflowAgent {
  readonly name: string;
  readonly systemPrompt: string;
  readonly description: string;
  readonly llm: LLM;
  readonly tools: BaseToolWithCall[];
  readonly canHandoffTo: string[];

  constructor({
    name,
    llm,
    description,
    tools,
    canHandoffTo,
    systemPrompt,
  }: {
    name: string;
    llm: LLM;
    description: string;
    tools: BaseToolWithCall[];
    canHandoffTo?: string[] | undefined;
    systemPrompt?: string | undefined;
  }) {
    this.name = name;
    this.llm = llm;
    this.description = description;
    this.tools = tools;
    this.canHandoffTo = canHandoffTo ?? [];
    this.systemPrompt = systemPrompt ?? DEFAULT_SYSTEM_PROMPT;
  }

  async takeStep(
    ctx: HandlerContext<AgentWorkflowContext>,
    llmInput: ChatMessage[],
    tools: BaseToolWithCall[],
    memory: BaseMemory,
  ): Promise<AgentOutput> {
    // Get scratchpad from context or initialize if not present
    const scratchpad: ChatMessage[] = ctx.data.scratchpad;
    const currentLLMInput = [...llmInput, ...scratchpad];

    const response = await this.llm.chat({
      messages: currentLLMInput,
      tools,
      stream: false,
    });

    const toolCalls: ToolCall[] = [];
    const options = response.message.options ?? {};

    if (options && "toolCall" in options && Array.isArray(options.toolCall)) {
      for (const call of options.toolCall) {
        try {
          // Convert input to arguments format
          let args: Record<string, unknown>;
          if (typeof call.input === "string") {
            try {
              args = JSON.parse(call.input);
            } catch (e) {
              args = { rawInput: call.input };
            }
          } else {
            args = call.input as Record<string, unknown>;
          }

          toolCalls.push({
            id: call.id,
            name: call.name,
            input: args as JSONObject,
          });
        } catch (error) {
          console.error(
            `[Agent ${this.name}]: Error processing tool call: ${error}`,
          );
        }
      }
    }

    // Add response to scratchpad
    scratchpad.push(response.message);
    ctx.data.scratchpad = scratchpad;

    return new AgentOutput({
      response: response.message,
      toolCalls,
      raw: response.raw,
      currentAgentName: this.name,
    });
  }

  async handleToolCallResults(
    ctx: HandlerContext<AgentWorkflowContext>,
    results: ToolCallResult[],
    memory: BaseMemory,
  ): Promise<void> {
    const scratchpad: ChatMessage[] = ctx.data.scratchpad;

    for (const result of results) {
      const content = stringifyJSONToMessageContent(result.toolResult.result);

      const rawToolMessage = {
        role: "user" as const,
        content,
        options: {
          toolResult: {
            id: result.toolCall.id,
            result: content,
            isError: result.toolResult.isError,
          },
        },
      };
      ctx.data.scratchpad.push(rawToolMessage);
    }

    ctx.data.scratchpad = scratchpad;
  }

  async finalize(
    ctx: HandlerContext<AgentWorkflowContext>,
    output: AgentOutput,
    memory: BaseMemory,
  ): Promise<AgentOutput> {
    // Get scratchpad messages
    const scratchpad: ChatMessage[] = ctx.data.scratchpad;

    for (const msg of scratchpad) {
      await memory.put(msg);
    }

    // Clear scratchpad after finalization
    ctx.data.scratchpad = [];

    return output;
  }
}
