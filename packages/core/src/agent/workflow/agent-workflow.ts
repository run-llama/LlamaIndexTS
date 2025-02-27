import {
  StartEvent,
  StopEvent,
  Workflow,
  WorkflowContext,
  WorkflowEvent,
  type HandlerContext,
} from "@llamaindex/workflow";
import { z } from "zod";
import type { JSONValue } from "../../global";
import type { BaseToolWithCall, ChatMessage, LLM, ToolCall } from "../../llms";
import { ChatMemoryBuffer } from "../../memory";
import { FunctionTool } from "../../tools";
import { stringifyJSONToMessageContent } from "../../utils";
import type {
  AgentWorkflowContext,
  BaseWorkflowAgent,
  ToolCallResult,
} from "./base";
import { FunctionAgent } from "./function-agent";

import { PromptTemplate } from "../../prompts";

export const DEFAULT_HANDOFF_PROMPT = new PromptTemplate({
  template: `Useful for handing off to another agent.
Currently available agents: 
{agent_info}

If you are currently not equipped to handle the user's request, or another agent is better suited to handle the request, please hand off to the appropriate agent.
Pick the agent name to hand off to from the list of available agents.
`,
});

export const DEFAULT_HANDOFF_OUTPUT_PROMPT = new PromptTemplate({
  template: `Agent {to_agent} is now handling the request due to the following reason: {reason}.\nPlease continue with the current request.`,
});

export type AgentInputData = {
  user_msg?: string | undefined;
  chat_history?: ChatMessage[] | undefined;
};

export class AgentSetup extends WorkflowEvent<{
  input: ChatMessage[];
  currentAgentName: string;
}> {}

export class AgentInput extends WorkflowEvent<{
  input: ChatMessage[];
  currentAgentName: string;
}> {}

export class AgentStepEvent extends WorkflowEvent<{
  agentName: string;
  response: ChatMessage;
  toolCalls: ToolCall[];
}> {}

export class ToolCallsEvent extends WorkflowEvent<{
  agentName: string;
  toolCalls: ToolCall[];
}> {}

export class ToolResultsEvent extends WorkflowEvent<{
  agentName: string;
  results: ToolCallResult[];
}> {}

export interface AgentWorkflowFromAgentsParams {
  rootAgentName: string;
  verbose?: boolean;
  timeout?: number;
  validate?: boolean;
}

/**
 * AgentWorkflow - An event-driven workflow for executing agents with tools
 *
 * This class provides a simple interface for creating and running agent workflows
 * based on the LlamaIndexTS workflow system. It supports single agent workflows
 * with multiple tools.
 */
export class AgentWorkflow {
  private workflow: Workflow<AgentWorkflowContext, AgentInputData, string>;
  private agents: Map<string, BaseWorkflowAgent> = new Map();
  private verbose: boolean;
  private rootAgentName: string;

  constructor({
    agents,
    rootAgent,
    verbose,
    timeout,
  }: {
    rootAgent: string;
    agents?: BaseWorkflowAgent[] | undefined;
    verbose?: boolean;
    timeout?: number;
  }) {
    this.workflow = new Workflow({
      verbose: verbose ?? false,
      timeout: timeout ?? 60,
    });
    this.verbose = verbose ?? false;
    this.rootAgentName = rootAgent;
    this.addAgents(agents ?? []);
  }

  private addAgents(agents: BaseWorkflowAgent[]): void {
    agents.forEach((agent) => {
      this.agents.set(agent.name, agent);
      // Add handoff tool to the agent if it has any handoff agents
      if (agent.canHandoffTo.length > 0) {
        const agentInfo = agent.canHandoffTo
          .map((a) => {
            const agent = this.agents.get(a);
            return `\n\t${a}: ${agent?.description ?? "Unknown description"}`;
          })
          .join("\n");
        const handoffTool = FunctionTool.from(
          // Dummy function for requesting LLM for handoff
          ({ toAgent, reason }: { toAgent: string; reason: string }) => "",
          {
            name: "handOff",
            description: DEFAULT_HANDOFF_PROMPT.format({
              agent_info: agentInfo,
            }),
            parameters: z.object({
              toAgent: z.string(),
              reason: z.string(),
            }),
          },
        );
        agent.tools.push(handoffTool);
      }
    });
  }

  /**
   * Create a simple workflow with a single agent and specified tools
   */
  static fromTools({
    tools,
    llm,
    systemPrompt,
    verbose,
    timeout,
  }: {
    tools: BaseToolWithCall[];
    llm: LLM;
    systemPrompt?: string;
    verbose?: boolean;
    timeout?: number;
  }): AgentWorkflow {
    const defaultAgentName = "Agent";
    const agent = new FunctionAgent({
      name: defaultAgentName,
      description: "A single agent that uses the provided tools or functions.",
      tools,
      llm,
      systemPrompt: systemPrompt,
    });

    const workflow = new AgentWorkflow({
      verbose: verbose ?? false,
      timeout: timeout ?? 60,
      rootAgent: defaultAgentName,
    });

    workflow.addAgent(agent);

    return workflow;
  }

  addAgent(agent: BaseWorkflowAgent): this {
    this.agents.set(agent.name, agent);
    return this;
  }

  private handleInputStep = async (
    ctx: HandlerContext<AgentWorkflowContext>,
    event: StartEvent<AgentInputData>,
  ): Promise<AgentInput> => {
    // Get input from event - StartEvent wraps the data in a { input: T } object
    const { user_msg, chat_history } = event.data;

    const memory = ctx.data.memory;
    if (chat_history) {
      chat_history.forEach((message) => {
        memory.put(message);
      });
    }
    if (user_msg) {
      const userMessage: ChatMessage = {
        role: "user",
        content: user_msg,
      };
      memory.put(userMessage);
    } else if (chat_history) {
      // If no user message, use the last message from chat history as user_msg_str
      const lastMessage =
        (chat_history[chat_history.length - 1]?.content as string) ?? "";
      ctx.data.userInput = lastMessage;
    } else {
      throw new Error("No user message or chat history provided");
    }

    return new AgentInput({
      input: await memory.getMessages(),
      currentAgentName: this.rootAgentName,
    });
  };

  private setupAgent = async (
    ctx: HandlerContext<AgentWorkflowContext>,
    event: AgentInput,
  ): Promise<AgentSetup> => {
    const currentAgentName = event.data.currentAgentName;
    const agent = this.agents.get(currentAgentName);
    if (!agent) {
      throw new Error(`Agent ${currentAgentName} not found`);
    }

    const llmInput = event.data.input;
    if (agent.systemPrompt) {
      // Add system prompt at the beginning of the llmInput
      llmInput.unshift({
        role: "system",
        content: agent.systemPrompt,
      });
    }

    return new AgentSetup({
      input: llmInput,
      currentAgentName: currentAgentName,
    });
  };

  private runAgentStep = async (
    ctx: HandlerContext<AgentWorkflowContext>,
    event: AgentSetup,
  ): Promise<
    WorkflowEvent<{
      agentName: string;
      response: ChatMessage;
      toolCalls: ToolCall[];
    }>
  > => {
    const agent = this.agents.get(event.data.currentAgentName);
    if (!agent) {
      throw new Error("No valid agent found");
    }

    if (this.verbose) {
      console.log(
        `[Agent ${agent.name}]: Running for input: ${event.data.input[event.data.input.length - 1]?.content}`,
      );
    }

    const output = await agent.takeStep(
      ctx,
      event.data.input,
      agent.tools,
      ctx.data.memory,
    );

    return new AgentStepEvent({
      agentName: agent.name,
      response: output.response,
      toolCalls: output.toolCalls,
    });
  };

  private parseAgentOutput = async (
    ctx: HandlerContext<AgentWorkflowContext>,
    event: AgentStepEvent,
  ): Promise<ToolCallsEvent | StopEvent<{ result: string }>> => {
    const { agentName, response, toolCalls } = event.data;

    // If no tool calls, return final response
    if (!toolCalls || toolCalls.length === 0) {
      if (this.verbose) {
        console.log(
          `[Agent ${agentName}]: No tool calls to process, returning final response`,
        );
      }
      const agentOutput = {
        response,
        toolCalls: [],
        raw: response,
        currentAgentName: agentName,
      };
      const content = await this.agents
        .get(agentName)
        ?.finalize(ctx, agentOutput, ctx.data.memory);

      return new StopEvent({
        result: content?.response.content as string,
      });
    }

    return new ToolCallsEvent({
      agentName,
      toolCalls,
    });
  };

  private executeToolCalls = async (
    ctx: HandlerContext<AgentWorkflowContext>,
    event: ToolCallsEvent,
  ): Promise<ToolResultsEvent | StopEvent<{ result: string }>> => {
    const { agentName, toolCalls } = event.data;
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }
    const results: ToolCallResult[] = [];

    // Execute each tool call
    for (const toolCall of toolCalls) {
      try {
        // Find matching tool
        const tool = agent.tools.find((t) => t.metadata.name === toolCall.name);

        if (!tool) {
          // Add error result if tool not found
          results.push({
            toolCall,
            toolResult: {
              id: toolCall.id,
              result: `Tool ${toolCall.name} not found`,
              isError: true,
            },
            returnDirect: false,
          });
          continue;
        }

        // Execute tool
        // TODO: Because LITS doesn't support tool requires context,
        // we need to handle the handoff by AgentWorkflow to manipulate the context.
        let output: JSONValue;
        if (tool.metadata.name === "handOff") {
          output = await this.handOff(
            ctx,
            toolCall.input as {
              toAgent: string;
              reason: string;
            },
          );
        } else {
          output = await tool.call(toolCall.input);
        }

        // Add success result
        results.push({
          toolCall,
          toolResult: {
            id: toolCall.id,
            result: stringifyJSONToMessageContent(output),
            isError: false,
          },
          returnDirect: toolCall.name === "handOff",
        });
      } catch (error) {
        // Add error result
        results.push({
          toolCall,
          toolResult: {
            id: toolCall.id,
            result: `Error: ${error}`,
            isError: true,
          },
          returnDirect: false,
        });
      }
    }

    return new ToolResultsEvent({
      agentName,
      results,
    });
  };

  private processToolResults = async (
    ctx: HandlerContext<AgentWorkflowContext>,
    event: ToolResultsEvent,
  ): Promise<AgentInput | StopEvent<{ result: string }>> => {
    const { agentName, results } = event.data;

    // Get agent
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }

    await agent.handleToolCallResults(ctx, results, ctx.data.memory);

    const directResult = results.find((r) => r.returnDirect);
    if (directResult) {
      const isHandoff = directResult.toolCall.name === "handOff";

      const output =
        typeof directResult.toolResult.result === "string"
          ? directResult.toolResult.result
          : JSON.stringify(directResult.toolResult.result);

      const agentOutput = {
        response: {
          role: "assistant" as const,
          content: output,
        },
        toolCalls: [],
        raw: output,
        currentAgentName: agent.name,
      };

      await agent.finalize(ctx, agentOutput, ctx.data.memory);

      if (isHandoff) {
        const nextAgentName = ctx.data.nextAgentName;
        console.log(
          `[Agent ${agentName}]: Handoff to ${nextAgentName}: ${directResult.toolResult.result}`,
        );
        if (nextAgentName) {
          ctx.data.currentAgentName = nextAgentName;
          ctx.data.nextAgentName = null;

          const messages = await ctx.data.memory.getMessages();
          return new AgentInput({
            input: messages,
            currentAgentName: nextAgentName,
          });
        }
      }

      return new StopEvent({
        result: output,
      });
    }

    // Continue with another agent step
    const messages = await ctx.data.memory.getMessages();
    return new AgentInput({
      input: messages,
      currentAgentName: agent.name,
    });
  };

  private setupWorkflowSteps() {
    this.workflow.addStep(
      {
        inputs: [StartEvent<AgentInputData>],
        outputs: [AgentInput],
      },
      this.handleInputStep,
    );

    this.workflow.addStep(
      {
        inputs: [AgentInput],
        outputs: [AgentSetup],
      },
      this.setupAgent,
    );

    this.workflow.addStep(
      {
        inputs: [AgentSetup],
        outputs: [AgentStepEvent],
      },
      this.runAgentStep,
    );

    this.workflow.addStep(
      {
        inputs: [AgentStepEvent],
        outputs: [ToolCallsEvent, StopEvent],
      },
      this.parseAgentOutput,
    );

    this.workflow.addStep(
      {
        inputs: [ToolCallsEvent],
        outputs: [ToolResultsEvent, StopEvent],
      },
      this.executeToolCalls,
    );

    this.workflow.addStep(
      {
        inputs: [ToolResultsEvent],
        outputs: [AgentInput, StopEvent],
      },
      this.processToolResults,
    );

    return this;
  }

  run(
    input: string,
    chatHistory?: ChatMessage[],
  ): WorkflowContext<AgentInputData, string, AgentWorkflowContext> {
    if (this.agents.size === 0) {
      throw new Error("No agents added to workflow");
    }
    this.setupWorkflowSteps();
    const contextData: AgentWorkflowContext = {
      userInput: input,
      memory: new ChatMemoryBuffer(),
      scratchpad: [],
      currentAgentName: this.rootAgentName,
      agents: Array.from(this.agents.keys()),
      nextAgentName: null,
    };

    const result = this.workflow.run(
      {
        user_msg: input,
        chat_history: chatHistory,
      },
      contextData,
    );

    return result;
  }

  /**
   * Handoff to another agent
   */
  private async handOff(
    ctx: HandlerContext<AgentWorkflowContext>,
    {
      toAgent,
      reason,
    }: {
      toAgent: string;
      reason: string;
    },
  ) {
    const agents = ctx.data.agents;
    if (!agents.includes(toAgent)) {
      return `Agent ${toAgent} not found. Select a valid agent to hand off to. Valid agents: ${agents.join(
        ", ",
      )}`;
    }
    ctx.data.nextAgentName = toAgent;
    return DEFAULT_HANDOFF_OUTPUT_PROMPT.format({
      to_agent: toAgent,
      reason: reason,
    });
  }
}
