import { type WorkflowContext, type WorkflowEvent } from "@llama-flow/core";
import type { JSONObject } from "@llamaindex/core/global";
import { Settings } from "@llamaindex/core/global";
import {
  ToolCallLLM,
  type BaseToolWithCall,
  type ChatMessage,
  type ChatResponseChunk,
} from "@llamaindex/core/llms";
import { tool } from "@llamaindex/core/tools";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { AgentWorkflow } from "./agent-workflow";
import { type AgentWorkflowState, type BaseWorkflowAgent } from "./base";
import {
  agentStreamEvent,
  type AgentOutput,
  type AgentToolCall,
  type AgentToolCallResult,
} from "./events";

const DEFAULT_SYSTEM_PROMPT =
  "You are a helpful assistant. Use the provided tools to answer questions.";

const STEP_HANDLER_SYSTEM_PROMPT_TPL = `
You are a part of a program that is composed of multiple steps. 
Your task is to handle the step using the provided tools and finally send an output event back to the workflow and summarize the result.

## Instructions
### Follow these default instructions:
1. Provide a plan to handle the actions based on context and the user request.
2. Use the provided tools to proceed with your actions.
3. Always trigger the \`sendOutputEvent\` tool to send the output event to the workflow.
4. Summarize the output event in a concise manner.

### Also follow these user's instructions:
{instructions}
`;

export type StepHandlerParams = {
  /**
   * Workflow context
   */
  workflowContext: WorkflowContext;
  /**
   * User instructions to guide the agent to handle the step.
   */
  instructions: string;
  /**
   * Event that this agent will return
   */
  result: WorkflowEvent<unknown> & { schema: z.ZodType<unknown> };
  /**
   * List of additional events that the agent can emit
   */
  events?: EmitEvent[] | undefined;
  /**
   * LLM to use for the agent, required.
   */
  llm?: ToolCallLLM | undefined;
  /**
   * List of tools that the agent can use
   */
  tools?: BaseToolWithCall[] | undefined;
};

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
  tools?: BaseToolWithCall[] | undefined;
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

export type EmitEvent = {
  event: WorkflowEvent<unknown> & { schema: z.ZodType<unknown> };
  name: string;
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
    this.tools = tools ?? [];
    this.systemPrompt = systemPrompt ?? DEFAULT_SYSTEM_PROMPT;
    this.canHandoffTo = this.initHandOffNames(canHandoffTo ?? []);
  }

  private initHandOffNames(
    handoffTo: string[] | BaseWorkflowAgent[] | AgentWorkflow[],
  ): string[] {
    const handoffToNames: string[] = [];
    if (handoffTo) {
      if (Array.isArray(handoffTo)) {
        if (handoffTo.length > 0) {
          if (typeof handoffTo[0] === "string") {
            // string[] case
            handoffToNames.push(...(handoffTo as string[]));
          } else if (handoffTo[0] instanceof AgentWorkflow) {
            // AgentWorkflow[] case
            const workflows = handoffTo as AgentWorkflow[];
            workflows.forEach((workflow) => {
              const agentNames = workflow
                .getAgents()
                .map((agent) => agent.name);
              handoffToNames.push(...agentNames);
            });
          } else {
            // BaseWorkflowAgent[] case
            const agents = handoffTo as BaseWorkflowAgent[];
            handoffToNames.push(...agents.map((agent) => agent.name));
          }
        }
      }
    }
    const uniqueHandoffAgents = new Set(handoffToNames);
    if (uniqueHandoffAgents.size !== handoffToNames.length) {
      throw new Error("Duplicate handoff agents");
    }
    return handoffToNames;
  }

  async takeStep(
    ctx: WorkflowContext,
    state: AgentWorkflowState,
    llmInput: ChatMessage[],
    tools: BaseToolWithCall[],
  ): Promise<AgentOutput> {
    // Get scratchpad from context or initialize if not present
    const scratchpad: ChatMessage[] = state.scratchpad;
    const currentLLMInput = [...llmInput, ...scratchpad];

    const responseStream = await this.llm.chat({
      messages: currentLLMInput,
      tools,
      stream: true,
    });
    let response = "";
    let lastChunk: ChatResponseChunk | undefined;
    const toolCalls: Map<string, AgentToolCall> = new Map();
    for await (const chunk of responseStream) {
      response += chunk.delta;
      ctx.sendEvent(
        agentStreamEvent.with({
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
    state.scratchpad = scratchpad;
    return {
      response: message,
      toolCalls: Array.from(toolCalls.values()),
      raw: lastChunk?.raw,
      currentAgentName: this.name,
    };
  }

  async handleToolCallResults(
    state: AgentWorkflowState,
    results: AgentToolCallResult[],
  ): Promise<void> {
    const scratchpad: ChatMessage[] = state.scratchpad;

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
      state.scratchpad.push(rawToolMessage);
    }

    state.scratchpad = scratchpad;
  }

  async finalize(
    state: AgentWorkflowState,
    output: AgentOutput,
  ): Promise<AgentOutput> {
    // Get scratchpad messages
    const scratchpad: ChatMessage[] = state.scratchpad;

    for (const msg of scratchpad) {
      state.memory.put(msg);
    }

    // Clear scratchpad after finalization
    state.scratchpad = [];

    return output;
  }

  private getToolCallFromResponseChunk(
    responseChunk: ChatResponseChunk,
  ): AgentToolCall[] {
    const toolCalls: AgentToolCall[] = [];
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

  /**
   * Create a FunctionAgent to handle a step of the workflow.
   * @param params.workflowContext - The workflow context.
   * @param params.result - The event to send when the agent is done.
   * @param params.events - Additional events that the agent can emit.
   * @param params.instructions - The user instructions to guide the agent to handle the step.
   * @param params.tools - The tools to use for the agent.
   * @returns A new FunctionAgent instance
   */
  static fromWorkflowStep({
    workflowContext,
    result,
    events,
    instructions,
    tools,
    llm,
  }: StepHandlerParams): FunctionAgent {
    if (!workflowContext) {
      throw new Error("workflowContext must be provided");
    }
    if (!result) {
      throw new Error("result must be provided");
    }
    if (!instructions) {
      throw new Error("instructions must be provided");
    }
    const allTools = [
      ...(tools ?? []),
      createEventEmitterTool(
        "sendOutputEvent",
        result,
        workflowContext,
        "Use this tool to send the output event to the workflow. Always trigger this tool to complete your task.",
      ),
      ...(events ?? []).map((e) =>
        createEventEmitterTool(e.name, e.event, workflowContext),
      ),
    ];
    // Construct the system prompt
    const newSystemPrompt = STEP_HANDLER_SYSTEM_PROMPT_TPL.replace(
      "{instructions}",
      instructions,
    );

    // Check if llm is provided or default LLM is a tool call LLM
    const llmToUse = llm ?? Settings.llm;
    if (!(llmToUse instanceof ToolCallLLM)) {
      throw new Error("LLM must support tool calls");
    }
    // Create the function agent
    return new FunctionAgent({
      llm: llmToUse,
      systemPrompt: newSystemPrompt,
      tools: allTools,
    });
  }
}

/**
 * Create a tool that sends an event to the workflow.
 * @param name - The name of the tool.
 * @param event - The event to send.
 * @param workflowContext - The workflow context.
 * @param description - The description of the tool.
 */
const createEventEmitterTool = (
  name: string,
  event: WorkflowEvent<unknown> & { schema: z.ZodType<unknown> },
  workflowContext: WorkflowContext,
  description?: string,
) => {
  // To ensure the model correctly interprets the event data, including the schema in the tool description is crucial.
  // This is particularly important for special types like literals and enums, which the model might struggle with otherwise.
  // By incorporating the schema into the tool description, we can facilitate the model's understanding of the event data.
  const toolDescriptionWithSchema =
    (description ??
      event.schema.description ??
      "Use this tool to send the event to the workflow.") +
    `\n\nPlease provide the event data in the following JSON schema: ${JSON.stringify(zodToJsonSchema(event.schema))}`;
  return tool({
    name: name,
    description: toolDescriptionWithSchema,
    parameters: z.object({
      eventData: event.schema,
    }),
    execute: (
      { eventData }: { eventData?: z.infer<typeof event.schema> },
      getContext?: () => WorkflowContext,
    ) => {
      if (!getContext) {
        throw new Error("Workflow context is not provided.");
      }
      const context = getContext();
      context.sendEvent(event.with(eventData ?? {}));
      return `Successfully sent a ${name} event!`;
    },
  }).bind(() => workflowContext);
};
