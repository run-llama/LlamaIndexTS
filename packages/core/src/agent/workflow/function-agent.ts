import type { HandlerContext } from "@llamaindex/workflow";
import type { JSONObject } from "../../global";
import type {
  BaseToolWithCall,
  ChatMessage,
  LLM,
  MessageType,
  ToolCall,
} from "../../llms";
import { BaseMemory } from "../../memory";
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

/**
 * Helper to convert output to a string, handling objects
 */
function formatToolOutput(output: unknown): string {
  return typeof output === "object" ? JSON.stringify(output) : String(output);
}

// Define an interface for OpenAI tool message format
interface OpenAIToolMessage {
  role: "tool";
  content: string;
  tool_call_id: string; // Direct property, not nested
}

export class FunctionAgent implements BaseWorkflowAgent {
  readonly name: string;
  readonly llm: LLM;
  readonly scratchpadKey: string = "scratchpad";
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
    if (params.scratchpadKey) {
      this.scratchpadKey = params.scratchpadKey;
    }
  }

  async takeStep(
    ctx: HandlerContext<AgentWorkflowContext>,
    tools: BaseToolWithCall[],
    memory: BaseMemory,
  ): Promise<AgentOutput> {
    // Get scratchpad from context or initialize if not present
    const scratchpad: ChatMessage[] = ctx.data.scratchpad;

    const memoryMessages = await memory.getMessages();

    this.logger.info(
      `Calling LLM with messages: ${JSON.stringify(memoryMessages)}`,
    );
    const response = await this.llm.chat({
      messages: memoryMessages,
      tools,
      stream: false,
    });

    // Get tool calls from response
    const toolCalls: ToolCall[] = [];
    const options = response.message.options ?? {};

    // Extract tool calls from the response if they exist
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

    // Process each tool result and add to scratchpad only (not memory yet)
    for (const result of results) {
      // Format the output content
      const content = formatToolOutput(result.toolOutput.output);

      const rawToolMessage = {
        role: "assistant" as MessageType,
        content,
        tool_call_id: result.toolId,
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
