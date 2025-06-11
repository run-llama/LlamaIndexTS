import {
  createWorkflow,
  getContext,
  workflowEvent,
  type Handler,
  type Workflow,
  type WorkflowContext,
  type WorkflowEvent,
  type WorkflowEventData,
} from "@llama-flow/core";
import { createStatefulMiddleware } from "@llama-flow/core/middleware/state";
import { Settings } from "@llamaindex/core/global";
import type { ChatMessage, MessageContent } from "@llamaindex/core/llms";
import { ChatMemoryBuffer } from "@llamaindex/core/memory";
import { PromptTemplate } from "@llamaindex/core/prompts";
import { tool } from "@llamaindex/core/tools";
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
import {
  FunctionAgent,
  type FunctionAgentParams,
  type StepHandlerParams,
} from "./function-agent";

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
  userInput?: MessageContent | undefined;
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
  state?: AgentWorkflowState | undefined;
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
} & Pick<
    StepHandlerParams,
    "returnEvent" | "handlePrompt" | "emitEvents" | "workflowContext"
  >;

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
  if (params.returnEvent) {
    return AgentWorkflow.fromStepHandler({
      ...params,
    });
  }
  return AgentWorkflow.fromTools(params);
};

/**
 * AgentWorkflow - An event-driven workflow for executing agents with tools
 *
 * This class provides a simple interface for creating and running agent workflows
 * based on the LlamaIndexTS workflow system. It supports single agent workflows
 * with multiple tools.
 */
export class AgentWorkflow implements Workflow {
  private stateful = createStatefulMiddleware(
    (state: AgentWorkflowState) => state,
  );
  private workflow = this.stateful.withState(createWorkflow());
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

  handle<
    const AcceptEvents extends WorkflowEvent<unknown>[],
    Result extends ReturnType<WorkflowEvent<unknown>["with"]> | void,
  >(accept: AcceptEvents, handler: Handler<AcceptEvents, Result>): void {
    this.workflow.handle(accept, handler);
  }

  createContext(): WorkflowContext {
    return this.workflow.createContext(this.createInitialState());
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
    const handoffTool = this.createHandoffTool(toHandoffAgents);
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

  /**
   * Create a single agent to handle a workflow step
   * @param params - Parameters for the step handler
   * @returns A new AgentWorkflow instance
   */
  static fromStepHandler(params: StepHandlerParams): AgentWorkflow {
    const agent = FunctionAgent.fromWorkflowStep({
      workflowContext: params.workflowContext,
      returnEvent: params.returnEvent,
      emitEvents: params.emitEvents,
      handlePrompt: params.handlePrompt,
      tools: params.tools,
      llm: params.llm,
    });
    return new AgentWorkflow({
      agents: [agent],
      rootAgent: agent,
    });
  }

  private handleInputStep = async (
    event: WorkflowEventData<AgentInputData>,
  ) => {
    const { state } = this.stateful.getContext();
    const { userInput, chatHistory } = event.data;
    const memory = state.memory;
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
    } else {
      throw new Error("No user message or chat history provided");
    }
    if (this.verbose) {
      console.log(`[Agent ${this.rootAgentName}]: Starting agent`);
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
    const { sendEvent } = this.stateful.getContext();
    const agent = this.agents.get(event.data.currentAgentName);
    if (!agent) {
      throw new Error("No valid agent found");
    }

    const output = await agent.takeStep(
      this.stateful.getContext(),
      this.stateful.getContext().state,
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
        this.stateful.getContext().state,
        agentOutput,
      );

      return stopAgentEvent.with({
        result: content.response.content,
        state: this.stateful.getContext().state,
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

    await agent.handleToolCallResults(
      this.stateful.getContext().state,
      results,
    );

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

      await agent.finalize(this.stateful.getContext().state, agentOutput);

      if (isHandoff) {
        const nextAgentName = this.stateful.getContext().state.nextAgentName;
        console.log(
          `[Agent ${agentName}]: Handoff to ${nextAgentName}: ${directResult.toolOutput.result}`,
        );
        if (nextAgentName) {
          this.stateful.getContext().state.currentAgentName = nextAgentName;
          this.stateful.getContext().state.nextAgentName = null;

          const messages = await this.stateful
            .getContext()
            .state.memory.getMessages();
          if (this.verbose) {
            console.log(`[Agent ${nextAgentName}]: Starting agent`);
          }
          return agentInputEvent.with({
            input: messages,
            currentAgentName: nextAgentName,
          });
        }
      }

      return stopAgentEvent.with({
        result: output,
        state: this.stateful.getContext().state,
      });
    }

    // Continue with another agent step
    const messages = await this.stateful
      .getContext()
      .state.memory.getMessages();
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
    return tool.call(toolCall.toolKwargs);
  }

  private createInitialState(): AgentWorkflowState {
    return {
      memory: new ChatMemoryBuffer({
        llm: this.agents.get(this.rootAgentName)?.llm ?? Settings.llm,
      }),
      scratchpad: [],
      currentAgentName: this.rootAgentName,
      agents: Array.from(this.agents.keys()),
      nextAgentName: null,
    };
  }

  runStream(
    userInput: MessageContent,
    params?: {
      chatHistory?: ChatMessage[];
      state?: AgentWorkflowState;
    },
  ) {
    if (this.agents.size === 0) {
      throw new Error("No agents added to workflow");
    }
    const state = params?.state ?? this.createInitialState();

    const { sendEvent, stream } = this.workflow.createContext(state);
    sendEvent(
      startAgentEvent.with({
        userInput: userInput,
        chatHistory: params?.chatHistory,
      }),
    );
    return stream.until(stopAgentEvent);
  }

  async run(
    userInput: MessageContent,
    params?: {
      chatHistory?: ChatMessage[];
      state?: AgentWorkflowState;
    },
  ): Promise<WorkflowEventData<AgentResultData>> {
    const finalEvent = (await this.runStream(userInput, params).toArray()).at(
      -1,
    );
    if (!stopAgentEvent.include(finalEvent)) {
      throw new Error(
        `Agent stopped with unexpected ${finalEvent?.toString() ?? "unknown"} event.`,
      );
    }
    return finalEvent;
  }

  createHandoffTool(agents: Map<string, BaseWorkflowAgent>) {
    const agentInfo = Array.from(agents.values()).reduce(
      (acc, a) => {
        acc[a.name] = a.description;
        return acc;
      },
      {} as Record<string, string>,
    );
    return tool({
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
      execute: (
        {
          toAgent,
          reason,
        }: {
          toAgent: string;
          reason: string;
        },
        contextProvider?: () => AgentWorkflowState,
      ) => {
        if (!contextProvider) {
          throw new Error(
            "Handoff tool internal error: Context was not provided.",
          );
        }
        const context = contextProvider();
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
    }).bind(() => this.stateful.getContext().state);
  }

  handleWorkflowStep = async (event: WorkflowEventData<unknown>) => {
    const agent = this.agents.get(this.rootAgentName);
    if (!agent) {
      throw new Error("No valid agent found");
    }

    const { sendEvent, stream } = this.workflow.createContext(
      this.createInitialState(),
    );
    sendEvent(
      startAgentEvent.with({
        userInput: "Handle with this input data: " + JSON.stringify(event.data),
      }),
    );
    const events = await stream.until(stopAgentEvent).toArray();
    const finalEvent = events[events.length - 1];
    if (!stopAgentEvent.include(finalEvent)) {
      throw new Error(
        `Agent stopped with unexpected ${finalEvent?.toString() ?? "unknown"} event.`,
      );
    }
    return finalEvent;
  };
}

/**
 * Handle a workflow step with an agent
 * @param params - Parameters for the step handler
 * @returns A function that handles a workflow step
 */
export const handleWithAgent = (
  params: Omit<StepHandlerParams, "workflowContext">,
) => {
  return async (event: WorkflowEventData<unknown>) => {
    const context = getContext();

    return await agent({
      ...params,
      workflowContext: context,
    }).handleWorkflowStep(event);
  };
};
