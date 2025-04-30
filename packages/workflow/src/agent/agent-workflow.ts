import {
  createWorkflow,
  getContext,
  workflowEvent,
  type WorkflowEventData,
} from "@llama-flow/core";
import { withStore } from "@llama-flow/core/middleware/store";
import { collect } from "@llama-flow/core/stream/consumer";
import { until } from "@llama-flow/core/stream/until";
import { Settings } from "@llamaindex/core/global";
import type { ChatMessage, MessageContent } from "@llamaindex/core/llms";
import { ChatMemoryBuffer } from "@llamaindex/core/memory";
import { PromptTemplate } from "@llamaindex/core/prompts";
import { FunctionTool } from "@llamaindex/core/tools";
import { stringifyJSONToMessageContent } from "@llamaindex/core/utils";
import { z } from "zod";
import type { AgentWorkflowState, BaseWorkflowAgent } from "./base";
import {
  agentInputEvent,
  agentOutputEvent,
  agentSetupEvent,
  agentToolCallEvent,
  agentToolCallResultEvent,
  type AgentInput,
  type AgentSetup,
  type AgentToolCall,
  type AgentToolCallResult,
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
export const startAgentEvent = workflowEvent<
  AgentInputData,
  "llamaindex-start"
>({
  debugLabel: "llamaindex-start",
});

export type AgentResultData = {
  result: MessageContent;
  state: AgentWorkflowState;
};
export const stopAgentEvent = workflowEvent<AgentResultData, "llamaindex-stop">(
  {
    debugLabel: "llamaindex-stop",
  },
);

// Wrapper events for multiple tool calls and results
export type ToolCalls = {
  agentName: string;
  toolCalls: AgentToolCall[];
};
export const toolCallsEvent = workflowEvent<ToolCalls>();

export type ToolResults = {
  agentName: string;
  results: AgentToolCallResult[];
};
export const toolResultsEvent = workflowEvent<ToolResults>();

export type AgentStep = {
  agentName: string;
  response: ChatMessage;
  toolCalls: AgentToolCall[];
};
export const agentStepEvent = workflowEvent<AgentStep>();

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
  private workflow = withStore(
    (state: AgentWorkflowState) => state,
    createWorkflow(),
  );
  private agents: Map<string, BaseWorkflowAgent> = new Map();
  private verbose: boolean;
  private rootAgentName: string;

  constructor({ agents, rootAgent, verbose }: AgentWorkflowParams) {
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
    this.setupWorkflowSteps();
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
    event: WorkflowEventData<AgentInputData>,
  ) => {
    const { userInput, chatHistory } = event.data;
    const memory = this.workflow.getStore().memory;
    if (chatHistory) {
      chatHistory.forEach((message: ChatMessage) => {
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
      this.workflow.getStore().userInput = lastMessage.content as string;
    } else {
      throw new Error("No user message or chat history provided");
    }

    return agentInputEvent.with({
      input: await memory.getMessages(),
      currentAgentName: this.rootAgentName,
    });
  };

  private setupAgent = async (event: WorkflowEventData<AgentInput>) => {
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

    return agentSetupEvent.with({
      input: llmInput,
      currentAgentName: currentAgentName,
    });
  };

  private runAgentStep = async (event: WorkflowEventData<AgentSetup>) => {
    const { sendEvent } = getContext();
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
      getContext(),
      this.workflow.getStore(),
      event.data.input,
      agent.tools,
    );

    sendEvent(
      agentStepEvent.with({
        agentName: agent.name,
        response: output.response,
        toolCalls: output.toolCalls,
      }),
    );

    sendEvent(agentOutputEvent.with(output));
  };

  private parseAgentOutput = async (event: WorkflowEventData<AgentStep>) => {
    const { agentName, response, toolCalls } = event.data;
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(
        `parseAgentOutput failed: agent ${agentName} does not exist`,
      );
    }

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
      const content = await agent.finalize(
        this.workflow.getStore(),
        agentOutput,
      );

      return stopAgentEvent.with({
        result: content.response.content,
        state: this.workflow.getStore(),
      });
    }

    return toolCallsEvent.with({
      agentName,
      toolCalls,
    });
  };

  private executeToolCalls = async (event: WorkflowEventData<ToolCalls>) => {
    const { sendEvent } = getContext();
    const { agentName, toolCalls } = event.data;
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }

    const results: AgentToolCallResult[] = [];

    // Execute each tool call
    for (const toolCall of toolCalls) {
      // Send single tool call event, useful for UI
      sendEvent(agentToolCallEvent.with(toolCall));
      const toolResult = {
        toolName: toolCall.toolName,
        toolKwargs: toolCall.toolKwargs,
        toolId: toolCall.toolId,
        toolOutput: {
          id: toolCall.toolId,
          result: "",
          isError: false,
        },
        returnDirect: false,
        raw: {},
      };
      try {
        const output = await this.callTool(toolCall);
        toolResult.raw = output;
        toolResult.toolOutput.result = stringifyJSONToMessageContent(output);
        toolResult.returnDirect = toolCall.toolName === "handOff";
      } catch (error) {
        toolResult.toolOutput.isError = true;
        toolResult.toolOutput.result = `Error: ${error}`;
      }
      results.push(toolResult);
      // Send single tool result event, useful for UI
      sendEvent(agentToolCallResultEvent.with(toolResult));
    }

    return toolResultsEvent.with({
      agentName,
      results,
    });
  };

  private processToolResults = async (
    event: WorkflowEventData<ToolResults>,
  ) => {
    const { agentName, results } = event.data;

    // Get agent
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }

    await agent.handleToolCallResults(this.workflow.getStore(), results);

    const directResult = results.find(
      (r: AgentToolCallResult) => r.returnDirect,
    );
    if (directResult) {
      const isHandoff = directResult.toolName === "handOff";

      const output =
        typeof directResult.toolOutput.result === "string"
          ? directResult.toolOutput.result
          : JSON.stringify(directResult.toolOutput.result);

      const agentOutput = {
        response: {
          role: "assistant" as const,
          content: output,
        },
        toolCalls: [],
        raw: output,
        currentAgentName: agent.name,
      };

      await agent.finalize(this.workflow.getStore(), agentOutput);

      if (isHandoff) {
        const nextAgentName = this.workflow.getStore().nextAgentName;
        console.log(
          `[Agent ${agentName}]: Handoff to ${nextAgentName}: ${directResult.toolOutput.result}`,
        );
        if (nextAgentName) {
          this.workflow.getStore().currentAgentName = nextAgentName;
          this.workflow.getStore().nextAgentName = null;

          const messages = await this.workflow.getStore().memory.getMessages();
          return agentInputEvent.with({
            input: messages,
            currentAgentName: nextAgentName,
          });
        }
      }

      return stopAgentEvent.with({
        result: output,
        state: this.workflow.getStore(),
      });
    }

    // Continue with another agent step
    const messages = await this.workflow.getStore().memory.getMessages();
    return agentInputEvent.with({
      input: messages,
      currentAgentName: agent.name,
    });
  };

  private setupWorkflowSteps() {
    this.workflow.handle([startAgentEvent], this.handleInputStep);
    this.workflow.handle([agentInputEvent], this.setupAgent);
    this.workflow.handle([agentSetupEvent], this.runAgentStep);
    this.workflow.handle([agentStepEvent], this.parseAgentOutput);
    this.workflow.handle([toolCallsEvent], this.executeToolCalls);
    this.workflow.handle([toolResultsEvent], this.processToolResults);
  }

  private callTool(toolCall: AgentToolCall) {
    const tool = this.agents
      .get(toolCall.agentName)
      ?.tools.find((t) => t.metadata.name === toolCall.toolName);
    if (!tool) {
      throw new Error(`Tool ${toolCall.toolName} not found`);
    }
    if (tool.metadata.requireContext) {
      const input = {
        context: this.workflow.getStore(),
        ...toolCall.toolKwargs,
      };
      return tool.call(input);
    } else {
      return tool.call(toolCall.toolKwargs);
    }
  }

  runStream(
    userInput: string,
    params?: {
      chatHistory?: ChatMessage[];
      state?: AgentWorkflowState;
    },
  ) {
    if (this.agents.size === 0) {
      throw new Error("No agents added to workflow");
    }
    const state: AgentWorkflowState = {
      ...(params?.state ?? {
        memory: new ChatMemoryBuffer({
          llm: this.agents.get(this.rootAgentName)?.llm ?? Settings.llm,
        }),
        scratchpad: [],
        currentAgentName: this.rootAgentName,
        agents: Array.from(this.agents.keys()),
        nextAgentName: null,
      }),
      userInput: userInput,
    };

    const { sendEvent, stream } = this.workflow.createContext(state);
    sendEvent(
      startAgentEvent.with({
        userInput: userInput,
        chatHistory: params?.chatHistory,
      }),
    );
    return until(stream, stopAgentEvent);
  }

  async run(
    userInput: string,
    params?: {
      chatHistory?: ChatMessage[];
      state?: AgentWorkflowState;
    },
  ): Promise<WorkflowEventData<AgentResultData>> {
    const allEvents = await collect(this.runStream(userInput, params));
    const finalEvent = allEvents[allEvents.length - 1];
    if (!stopAgentEvent.include(finalEvent)) {
      throw new Error(
        `Agent stopped with unexpected ${finalEvent?.toString() ?? "unknown"} event.`,
      );
    }
    return finalEvent;
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
      context?: AgentWorkflowState;
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
