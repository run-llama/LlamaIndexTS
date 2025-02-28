import type { JSONObject } from "@llamaindex/core/global";
import type {
  BaseToolWithCall,
  ChatMessage,
  ChatResponseChunk,
  LLM,
} from "@llamaindex/core/llms";
import { BaseMemory } from "@llamaindex/core/memory";
import type { HandlerContext } from "../workflow-context";
import { type AgentWorkflowContext, type BaseWorkflowAgent } from "./base";
import {
  AgentOutput,
  AgentStream,
  AgentToolCall,
  AgentToolCallResult,
} from "./events";

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

    const responseStream = await this.llm.chat({
      messages: currentLLMInput,
      tools,
      stream: true,
    });
    let response = "";
    let lastChunk: ChatResponseChunk | undefined;
    for await (const chunk of responseStream) {
      response += chunk.delta;
      ctx.sendEvent(
        new AgentStream({
          delta: chunk.delta,
          response: response,
          currentAgentName: this.name,
          raw: chunk.raw,
        }),
      );
      lastChunk = chunk;
    }

    const message: ChatMessage = {
      role: "assistant" as const,
      content: response,
    };

    const toolCalls = lastChunk
      ? this.getToolCallFromResponseChunk(lastChunk)
      : [];
    if (toolCalls.length > 0) {
      message.options = {
        // We are having AgentToolCall and ToolCall which are very similar
        // TODO:Check for unification
        toolCall: toolCalls.map((toolCall) => ({
          name: toolCall.data.toolName,
          input: toolCall.data.toolKwargs,
          id: toolCall.data.toolId,
        })),
      };
    }
    scratchpad.push(message);
    ctx.data.scratchpad = scratchpad;
    return new AgentOutput({
      response: message,
      toolCalls,
      raw: lastChunk?.raw,
      currentAgentName: this.name,
    });
  }

  async handleToolCallResults(
    ctx: HandlerContext<AgentWorkflowContext>,
    results: AgentToolCallResult[],
    memory: BaseMemory,
  ): Promise<void> {
    const scratchpad: ChatMessage[] = ctx.data.scratchpad;

    for (const result of results) {
      const content = result.data.toolOutput.result;

      const rawToolMessage = {
        role: "user" as const,
        content,
        options: {
          toolResult: {
            id: result.data.toolId,
            result: content,
            isError: result.data.toolOutput.isError,
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

  // TODO: Check if we already have this
  private getToolCallFromResponseChunk(
    responseChunk: ChatResponseChunk,
  ): AgentToolCall[] {
    const options = responseChunk.options ?? {};
    if (options && "toolCall" in options && Array.isArray(options.toolCall)) {
      return options.toolCall.map((call) => {
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

        return new AgentToolCall({
          agentName: this.name,
          toolName: call.name,
          toolKwargs: toolKwargs,
          toolId: call.id,
        });
      });
    }

    return [];
  }
}
