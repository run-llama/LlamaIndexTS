import type {
  BaseToolWithCall,
  ChatMessage,
  ToolCallLLM,
} from "@llamaindex/core/llms";
import { ChatMemoryBuffer } from "@llamaindex/core/memory";
import { PromptTemplate } from "@llamaindex/core/prompts";
import { FunctionTool } from "@llamaindex/core/tools";
import { stringifyJSONToMessageContent } from "@llamaindex/core/utils";
import { z } from "zod";
import { Workflow } from "../workflow";
import type { HandlerContext, WorkflowContext } from "../workflow-context";
import { StartEvent, StopEvent, WorkflowEvent } from "../workflow-event";
import type { AgentWorkflowContext, BaseWorkflowAgent } from "./base";
import {
  AgentInput,
  AgentOutput,
  AgentSetup,
  AgentToolCall,
  AgentToolCallResult,
} from "./events";
import { FunctionAgent } from "./function-agent";

export const DEFAULT_HANDOFF_PROMPT = new PromptTemplate({
  template: `Useful for handing off to another agent.
If you are currently not equipped to handle the user's request, or another agent is better suited to handle the request, please hand off to the appropriate agent.

Currently available agents: 
{agent_info}
`,
});

export const DEFAULT_HANDOFF_OUTPUT_PROMPT = new PromptTemplate({
  template: `Agent {to_agent} is now handling the request due to the following reason: {reason}.\nPlease continue with the current request.`,
});

export type AgentInputData = {
  userInput?: string | undefined;
  chatHistory?: ChatMessage[] | undefined;
};

// Wrapper events for multiple tool calls and results
export class ToolCallsEvent extends WorkflowEvent<{
  agentName: string;
  toolCalls: AgentToolCall[];
}> {}

export class ToolResultsEvent extends WorkflowEvent<{
  agentName: string;
  results: AgentToolCallResult[];
}> {}

export class AgentStepEvent extends WorkflowEvent<{
  agentName: string;
  response: ChatMessage;
  toolCalls: AgentToolCall[];
}> {}

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

  private validateAgent(agent: BaseWorkflowAgent) {
    // Validate that all canHandoffTo agents exist
    const invalidAgents = agent.canHandoffTo.filter(
      (name) => !this.agents.has(name),
    );
    if (invalidAgents.length > 0) {
      throw new Error(
        `Agent "${agent.name}" references non-existent agents in canHandoffTo: ${invalidAgents.join(", ")}`,
      );
    }
  }

  private addHandoffTool(agent: BaseWorkflowAgent) {
    if (agent.canHandoffTo.length > 0) {
      agent.tools.push(createHandoffTool(this.agents));
    }
  }

  private addAgents(agents: BaseWorkflowAgent[]): void {
    // First pass: add all agents to the map
    agents.forEach((agent) => {
      this.agents.set(agent.name, agent);
    });

    // Second pass: validate and setup handoff tools
    agents.forEach((agent) => {
      this.validateAgent(agent);
      this.addHandoffTool(agent);
    });
  }

  addAgent(agent: BaseWorkflowAgent): this {
    this.agents.set(agent.name, agent);
    this.validateAgent(agent);
    this.addHandoffTool(agent);
    return this;
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
    llm: ToolCallLLM;
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
      systemPrompt,
    });

    const workflow = new AgentWorkflow({
      verbose: verbose ?? false,
      timeout: timeout ?? 60,
      rootAgent: defaultAgentName,
    });

    workflow.addAgent(agent);

    return workflow;
  }

  private handleInputStep = async (
    ctx: HandlerContext<AgentWorkflowContext>,
    event: StartEvent<AgentInputData>,
  ): Promise<AgentInput> => {
    const { userInput, chatHistory } = event.data;
    const memory = ctx.data.memory;
    if (chatHistory) {
      chatHistory.forEach((message) => {
        memory.put(message);
      });
    }
    if (userInput) {
      const userMessage: ChatMessage = {
        role: "user",
        content: userInput,
      };
      memory.put(userMessage);
    } else if (chatHistory) {
      // If no user message, use the last message from chat history as user_msg_str
      const lastMessage = chatHistory[chatHistory.length - 1];
      if (lastMessage?.role !== "user") {
        throw new Error(
          "Either provide a user message or a chat history with a user message as the last message",
        );
      }
      ctx.data.userInput = lastMessage.content as string;
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
  ): Promise<AgentStepEvent> => {
    const agent = this.agents.get(event.data.currentAgentName);
    if (!agent) {
      throw new Error("No valid agent found");
    }

    if (this.verbose) {
      console.log(
        `[Agent ${agent.name}]: Running for input: ${event.data.input[event.data.input.length - 1]?.content}`,
      );
    }

    const output = await agent.takeStep(ctx, event.data.input, agent.tools);

    ctx.sendEvent(output);

    return new AgentStepEvent({
      agentName: agent.name,
      response: output.data.response,
      toolCalls: output.data.toolCalls,
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
      const agentOutput = new AgentOutput({
        response,
        toolCalls: [],
        raw: response,
        currentAgentName: agentName,
      });
      const content = await this.agents
        .get(agentName)
        ?.finalize(ctx, agentOutput, ctx.data.memory);

      return new StopEvent({
        result: content?.data.response.content as string,
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

    const results: AgentToolCallResult[] = [];

    // Execute each tool call
    for (const toolCall of toolCalls) {
      // Send single tool call event, useful for UI
      ctx.sendEvent(toolCall);
      const toolResult = new AgentToolCallResult({
        toolName: toolCall.data.toolName,
        toolKwargs: toolCall.data.toolKwargs,
        toolId: toolCall.data.toolId,
        toolOutput: {
          id: toolCall.data.toolId,
          result: "",
          isError: false,
        },
        returnDirect: false,
      });
      try {
        const output = await this.callTool(toolCall, ctx);
        toolResult.data.toolOutput.result =
          stringifyJSONToMessageContent(output);
        toolResult.data.returnDirect = toolCall.data.toolName === "handOff";
      } catch (error) {
        toolResult.data.toolOutput.isError = true;
        toolResult.data.toolOutput.result = `Error: ${error}`;
      }
      results.push(toolResult);
      // Send single tool result event, useful for UI
      ctx.sendEvent(toolResult);
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

    await agent.handleToolCallResults(ctx, results);

    const directResult = results.find((r) => r.data.returnDirect);
    if (directResult) {
      const isHandoff = directResult.data.toolName === "handOff";

      const output =
        typeof directResult.data.toolOutput.result === "string"
          ? directResult.data.toolOutput.result
          : JSON.stringify(directResult.data.toolOutput.result);

      const agentOutput = new AgentOutput({
        response: {
          role: "assistant" as const,
          content: output,
        },
        toolCalls: [],
        raw: output,
        currentAgentName: agent.name,
      });

      await agent.finalize(ctx, agentOutput, ctx.data.memory);

      if (isHandoff) {
        const nextAgentName = ctx.data.nextAgentName;
        console.log(
          `[Agent ${agentName}]: Handoff to ${nextAgentName}: ${directResult.data.toolOutput.result}`,
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

  private callTool(
    toolCall: AgentToolCall,
    ctx: HandlerContext<AgentWorkflowContext>,
  ) {
    const tool = this.agents
      .get(toolCall.data.agentName)
      ?.tools.find((t) => t.metadata.name === toolCall.data.toolName);
    if (!tool) {
      throw new Error(`Tool ${toolCall.data.toolName} not found`);
    }
    if (tool.metadata.requireContext) {
      const input = { context: ctx.data, ...toolCall.data.toolKwargs };
      return tool.call(input);
    } else {
      return tool.call(toolCall.data.toolKwargs);
    }
  }

  run(
    userInput: string,
    params?: {
      chatHistory?: ChatMessage[];
      context?: AgentWorkflowContext;
    },
  ): WorkflowContext<AgentInputData, string, AgentWorkflowContext> {
    if (this.agents.size === 0) {
      throw new Error("No agents added to workflow");
    }
    this.setupWorkflowSteps();
    const contextData: AgentWorkflowContext = params?.context ?? {
      userInput: userInput,
      memory: new ChatMemoryBuffer(),
      scratchpad: [],
      currentAgentName: this.rootAgentName,
      agents: Array.from(this.agents.keys()),
      nextAgentName: null,
    };

    const result = this.workflow.run(
      {
        userInput: userInput,
        chatHistory: params?.chatHistory,
      },
      contextData,
    );

    return result;
  }
}

const createHandoffTool = (agents: Map<string, BaseWorkflowAgent>) => {
  const agentInfo = Array.from(agents.values()).reduce(
    (acc, a) => {
      acc[a.name] = a.description;
      return acc;
    },
    {} as Record<string, string>,
  );
  return FunctionTool.from(
    ({
      context,
      toAgent,
      reason,
    }: {
      context?: AgentWorkflowContext;
      toAgent: string;
      reason: string;
    }) => {
      if (!context) {
        throw new Error("Context is required for handoff");
      }
      const agents = context.agents;
      if (!agents.includes(toAgent)) {
        return `Agent ${toAgent} not found. Select a valid agent to hand off to. Valid agents: ${agents.join(
          ", ",
        )}`;
      }
      context.nextAgentName = toAgent;
      return DEFAULT_HANDOFF_OUTPUT_PROMPT.format({
        to_agent: toAgent,
        reason: reason,
      });
    },
    {
      name: "handOff",
      description: DEFAULT_HANDOFF_PROMPT.format({
        agent_info: JSON.stringify(agentInfo),
      }),
      parameters: z.object({
        toAgent: z.string({
          description: "The name of the agent to hand off to",
        }),
        reason: z.string({
          description: "The reason for handing off to the agent",
        }),
      }),
      requireContext: true,
    },
  );
};
