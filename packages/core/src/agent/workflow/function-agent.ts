import type { HandlerContext } from "@llamaindex/workflow";
import type { JSONObject } from "../../global";
import type { BaseToolWithCall, ChatMessage, LLM, ToolCall } from "../../llms";
import { BaseMemory } from "../../memory";
import { stringifyJSONToMessageContent } from "../../utils";
import {
  type AgentOutput,
  type AgentWorkflowContext,
  type BaseWorkflowAgent,
  type ToolCallResult,
} from "./base";

const consoleLogger = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
};
const emptyLogger = {
  log: () => {},
  error: () => {},
  warn: () => {},
  info: () => {},
};

export class FunctionAgent implements BaseWorkflowAgent {
  readonly name: string;
  readonly llm: LLM;
  private logger: {
    log: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
  };

  constructor(params: {
    name: string;
    llm: LLM;
    scratchpadKey?: string;
    verbose?: boolean;
  }) {
    this.name = params.name;
    this.llm = params.llm;
    this.logger = params.verbose ? consoleLogger : emptyLogger;
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

    this.logger.info(
      `Calling LLM with messages: ${JSON.stringify(currentLLMInput)}`,
    );
    const response = await this.llm.chat({
      messages: currentLLMInput,
      tools,
      stream: false,
    });

    const toolCalls: ToolCall[] = [];
    const options = response.message.options ?? {};

    if (options && "toolCall" in options && Array.isArray(options.toolCall)) {
      this.logger.info(
        `Found ${options.toolCall.length} tool calls in response`,
      );

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
          this.logger.error(`Error processing tool call: ${error}`);
        }
      }
    }

    // Add response to scratchpad
    scratchpad.push(response.message);
    ctx.data.scratchpad = scratchpad;

    return {
      response: response.message,
      toolCalls,
      raw: response.raw,
      currentAgentName: this.name,
    };
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
