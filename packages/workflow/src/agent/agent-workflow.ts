import {
  StartEvent,
  StopEvent,
  Workflow,
  WorkflowEvent,
  type StepContext,
} from "@llama-flow/llamaindex";
import type { ChatMessage } from "@llamaindex/core/llms";
import { ChatMemoryBuffer } from "@llamaindex/core/memory";
import { PromptTemplate } from "@llamaindex/core/prompts";
import { FunctionTool } from "@llamaindex/core/tools";
import { stringifyJSONToMessageContent } from "@llamaindex/core/utils";
import { z } from "zod";
import type { AgentWorkflowContext, BaseWorkflowAgent } from "./base";
import {
  AgentInput,
  AgentOutput,
  AgentSetup,
  AgentToolCall,
  AgentToolCallResult,
} from "./events";
import { FunctionAgent, type FunctionAgentParams } from "./function-agent";

const DEFAULT_HANDOFF_PROMPT = new PromptTemplate({
  template: `Useful for handing off to another agent.
If you are currently not equipped to handle the user's request, or another agent is better suited to handle the request, please hand off to the appropriate agent.

Currently available agents: 
{agent_info}
`,
});

const DEFAULT_HANDOFF_OUTPUT_PROMPT = new PromptTemplate({
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

export type SingleAgentParams = FunctionAgentParams & {
  /**
   * Whether to log verbose output
   */
  verbose?: boolean;
  /**
   * Timeout for the workflow in seconds
   */
  timeout?: number;
};

export type AgentWorkflowParams = {
  /**
   * List of agents to include in the workflow.
   * Need at least one agent.
   * Can also be an array of AgentWorkflow objects, in which case the agents from each workflow will be extracted.
   */
  agents: BaseWorkflowAgent[] | AgentWorkflow[];
  /**
   * The agent to start the workflow with.
   * Must be an agent in the `agents` list.
   * Can also be an AgentWorkflow object, in which case the workflow must have exactly one agent.
   */
  rootAgent: BaseWorkflowAgent | AgentWorkflow;
  verbose?: boolean;
  /**
   * Timeout for the workflow in seconds.
   */
  timeout?: number;
};

/**
 * Create a multi-agent workflow
 * @param params - Parameters for the AgentWorkflow
 * @returns A new AgentWorkflow instance
 */
export const multiAgent = (params: AgentWorkflowParams): AgentWorkflow => {
  return new AgentWorkflow(params);
};

/**
 * Create a simple workflow with a single agent and specified tools
 * @param params - Parameters for the single agent workflow
 * @returns A new AgentWorkflow instance
 */
export const agent = (params: SingleAgentParams): AgentWorkflow => {
  return AgentWorkflow.fromTools(params);
};

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

  constructor({ agents, rootAgent, verbose, timeout }: AgentWorkflowParams) {
    this.workflow = new Workflow();
    this.verbose = verbose ?? false;

    // Handle AgentWorkflow cases for agents
    const processedAgents: BaseWorkflowAgent[] = [];
    if (agents.length > 0) {
      if (agents[0] instanceof AgentWorkflow) {
        // If agents is AgentWorkflow[], extract the BaseWorkflowAgent from each workflow
        const agentWorkflows = agents as AgentWorkflow[];
        agentWorkflows.forEach((workflow) => {
          const workflowAgents = workflow.getAgents();
          processedAgents.push(...workflowAgents);
        });
      } else {
        // Otherwise, agents is already BaseWorkflowAgent[]
        processedAgents.push(...(agents as BaseWorkflowAgent[]));
      }
    }

    // Handle AgentWorkflow case for rootAgent and set rootAgentName
    if (rootAgent instanceof AgentWorkflow) {
      // If rootAgent is an AgentWorkflow, check if it has exactly one agent
      const rootAgents = rootAgent.getAgents();

      if (rootAgents.length !== 1) {
        throw new Error(
          `Root agent must be a single agent, but it is a workflow with ${rootAgents.length} agents`,
        );
      }

      // We know rootAgents[0] exists because we checked length === 1 above
      this.rootAgentName = rootAgents[0]!.name;
    } else {
      // Otherwise, rootAgent is already a BaseWorkflowAgent
      this.rootAgentName = rootAgent.name;
    }

    // Validate root agent
    if (!processedAgents.some((a) => a.name === this.rootAgentName)) {
      throw new Error(`Root agent ${this.rootAgentName} not found in agents`);
    }

    this.addAgents(processedAgents);
  }

  private addAgents(agents: BaseWorkflowAgent[]): void {
    const agentNames = new Set(agents.map((a) => a.name));
    if (agentNames.size !== agents.length) {
      throw new Error("The agent names must be unique!");
    }

    agents.forEach((agent) => {
      this.agents.set(agent.name, agent);
    });

    if (agents.length > 1) {
      agents.forEach((agent) => {
        this.validateAgent(agent);
        this.addHandoffTool(agent);
      });
    }
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
    if (agent.tools.some((t) => t.metadata.name === "handOff")) {
      return;
    }
    const toHandoffAgents: Map<string, BaseWorkflowAgent> = new Map();
    agent.canHandoffTo.forEach((name) => {
      toHandoffAgents.set(name, this.agents.get(name)!);
    });
    const handoffTool = createHandoffTool(toHandoffAgents);
    if (
      agent.canHandoffTo.length > 0 &&
      !agent.tools.some((t) => t.metadata.name === handoffTool.metadata.name)
    ) {
      agent.tools.push(handoffTool);
    }
  }

  /**
   * Adds a new agent to the workflow
   */
  addAgent(agent: BaseWorkflowAgent): this {
    this.agents.set(agent.name, agent);
    this.validateAgent(agent);
    this.addHandoffTool(agent);
    return this;
  }

  /**
   * Gets all agents in this workflow
   * @returns Array of agents in this workflow
   */
  getAgents(): BaseWorkflowAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Create a simple workflow with a single agent and specified tools
   * @param params - Parameters for the single agent workflow
   * @returns A new AgentWorkflow instance
   */
  static fromTools(params: SingleAgentParams): AgentWorkflow {
    const agent = new FunctionAgent({
      name: params.name,
      description: params.description,
      tools: params.tools,
      llm: params.llm,
      systemPrompt: params.systemPrompt,
      canHandoffTo: params.canHandoffTo,
    });

    const workflow = new AgentWorkflow({
      agents: [agent],
      rootAgent: agent,
      verbose: params.verbose ?? false,
      timeout: params.timeout ?? 60,
    });

    return workflow;
  }

  private handleInputStep = async (
    ctx: StepContext<AgentWorkflowContext>,
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
    ctx: StepContext<AgentWorkflowContext>,
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
    ctx: StepContext<AgentWorkflowContext>,
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
    ctx: StepContext<AgentWorkflowContext>,
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
    ctx: StepContext<AgentWorkflowContext>,
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
        raw: {},
      });
      try {
        const output = await this.callTool(toolCall, ctx);
        toolResult.data.raw = output;
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
    ctx: StepContext<AgentWorkflowContext>,
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
      },
      this.handleInputStep,
    );

    this.workflow.addStep(
      {
        inputs: [AgentInput],
      },
      this.setupAgent,
    );

    this.workflow.addStep(
      {
        inputs: [AgentSetup],
      },
      this.runAgentStep,
    );

    this.workflow.addStep(
      {
        inputs: [AgentStepEvent],
      },
      this.parseAgentOutput,
    );

    this.workflow.addStep(
      {
        inputs: [ToolCallsEvent],
      },
      this.executeToolCalls,
    );

    this.workflow.addStep(
      {
        inputs: [ToolResultsEvent],
      },
      this.processToolResults,
    );

    return this;
  }

  private callTool(
    toolCall: AgentToolCall,
    ctx: StepContext<AgentWorkflowContext>,
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
  ) {
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
