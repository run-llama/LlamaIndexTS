import {
  StartEvent,
  StopEvent,
  Workflow,
  WorkflowEvent,
  type HandlerContext,
} from "@llamaindex/workflow";
import type { JSONObject } from "../../global";
import type { BaseToolWithCall, ChatMessage, LLM, ToolCall } from "../../llms";
import { BaseMemory, ChatMemoryBuffer } from "../../memory";
import type {
  AgentWorkflowContext,
  BaseWorkflowAgent,
  ToolCallResult,
} from "./base";
import { FunctionAgent } from "./function-agent";

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

// Define types for constructor params to avoid type issues
interface WorkflowConstructorParams {
  verbose?: boolean;
  timeout?: number;
  validate?: boolean;
  ignoreDeprecatedWarning?: boolean;
}

interface AgentConstructorParams {
  name: string;
  llm: LLM;
  verbose?: boolean;
  scratchpadKey?: string;
}

/**
 * AgentWorkflow - An event-driven workflow for executing agents with tools
 *
 * This class provides a simple interface for creating and running agent workflows
 * based on the LlamaIndexTS workflow system. It supports single agent workflows
 * with multiple tools.
 */
export class AgentWorkflow {
  private workflow: Workflow<AgentWorkflowContext, string, string>;
  private agents: Map<string, BaseWorkflowAgent> = new Map();
  private memory: BaseMemory;
  private tools: BaseToolWithCall[] = [];
  private verbose: boolean;

  constructor(
    params: {
      verbose?: boolean;
      timeout?: number;
      validate?: boolean;
    } = {},
  ) {
    const workflowParams: WorkflowConstructorParams = {
      ignoreDeprecatedWarning: true,
    };

    if (params.verbose !== undefined) workflowParams.verbose = params.verbose;
    if (params.timeout !== undefined) workflowParams.timeout = params.timeout;
    if (params.validate !== undefined)
      workflowParams.validate = params.validate;

    this.workflow = new Workflow(workflowParams);
    this.verbose = params.verbose ?? false;
    this.memory = new ChatMemoryBuffer();
  }

  /**
   * Create a simple workflow with a single agent and specified tools
   */
  static fromTools(
    tools: BaseToolWithCall[],
    params: {
      llm: LLM;
      memory?: BaseMemory;
      name?: string;
      verbose?: boolean;
      timeout?: number;
      systemPrompt?: string;
    },
  ): AgentWorkflow {
    if (!params.llm) {
      throw new Error("LLM is required for AgentWorkflow.fromTools");
    }

    const workflowParams: {
      verbose?: boolean;
      timeout?: number;
      validate?: boolean;
    } = {};

    if (params.verbose !== undefined) workflowParams.verbose = params.verbose;
    if (params.timeout !== undefined) workflowParams.timeout = params.timeout;

    const workflow = new AgentWorkflow(workflowParams);

    workflow.tools = tools;

    // Create agent params
    const agentParams: AgentConstructorParams = {
      name: params.name || "agent",
      llm: params.llm,
    };

    if (params.verbose !== undefined) agentParams.verbose = params.verbose;

    const agent = new FunctionAgent(agentParams);
    workflow.addAgent(agent);

    // Set memory
    if (params.memory) {
      workflow.setMemory(params.memory);
    } else {
      // Initialize memory with system prompt if provided
      const memory = new ChatMemoryBuffer({ llm: params.llm });
      if (params.systemPrompt) {
        memory.put({ role: "system", content: params.systemPrompt });
      }
      workflow.setMemory(memory);
    }

    return workflow;
  }

  addAgent(agent: BaseWorkflowAgent): this {
    this.agents.set(agent.name, agent);
    return this;
  }

  setMemory(memory: BaseMemory): this {
    this.memory = memory;
    return this;
  }

  private handleInputStep = async (
    ctx: HandlerContext<AgentWorkflowContext>,
    event: StartEvent<unknown>,
  ): Promise<AgentInput> => {
    // Get input from event - StartEvent wraps the data in a { input: T } object
    const query = event.data as string;

    // Create user message and add to memory
    const userMessage: ChatMessage = {
      role: "user",
      content: query,
    };
    await this.memory.put(userMessage);

    if (this.verbose) {
      console.log(`Processing query: ${query}`);
    }

    // Return query event with the query
    return new AgentInput({
      input: [userMessage],
      currentAgentName: "default",
    });
  };

  private runAgentStep = async (
    ctx: HandlerContext<AgentWorkflowContext>,
    event: AgentInput,
  ): Promise<
    WorkflowEvent<{
      agentName: string;
      response: ChatMessage;
      toolCalls: ToolCall[];
    }>
  > => {
    // Get first agent (for now we only support single agent)
    const agent = this.agents.values().next().value;
    if (!agent) {
      throw new Error("No valid agent found");
    }

    if (this.verbose) {
      console.log(
        `Running agent step for query: ${event.data.input[event.data.input.length - 1]?.content}`,
      );
    }

    const output = await agent.takeStep(
      ctx,
      event.data.input,
      this.tools,
      this.memory,
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
        console.log("No tool calls to process, returning final response");
      }
      const agentOutput = {
        response,
        toolCalls: [],
        raw: response,
        currentAgentName: agentName,
      };
      const content = await this.agents
        .get(agentName)
        ?.finalize(ctx, agentOutput, this.memory);

      return new StopEvent({
        result: content?.response.content as string,
      });
    }

    // Otherwise, process tool calls
    if (this.verbose) {
      console.log(`Processing ${toolCalls.length} tool calls`);
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
    const results: ToolCallResult[] = [];

    // Execute each tool call
    for (const toolCall of toolCalls) {
      try {
        // Find matching tool
        const tool = this.tools.find((t) => t.metadata.name === toolCall.name);

        if (!tool) {
          // Add error result if tool not found
          results.push({
            toolId: toolCall.id,
            toolName: toolCall.name,
            toolOutput: {
              tool: undefined,
              input: toolCall.input as JSONObject,
              output: `Tool ${toolCall.name} not found`,
              isError: true,
            },
            returnDirect: false,
          });
          continue;
        }

        // Execute tool
        const output = await tool.call(toolCall.input);

        // Add success result
        results.push({
          toolId: toolCall.id,
          toolName: toolCall.name,
          toolOutput: {
            tool,
            input: toolCall.input as JSONObject,
            output,
            isError: false,
          },
          returnDirect: false,
        });
      } catch (error) {
        // Add error result
        results.push({
          toolId: toolCall.id,
          toolName: toolCall.name,
          toolOutput: {
            tool: undefined,
            input: toolCall.input as JSONObject,
            output: `Error: ${error}`,
            isError: true,
          },
          returnDirect: false,
        });
      }
    }

    if (this.verbose) {
      console.log(`Executed ${results.length} tool calls`);
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

    if (this.verbose) {
      console.log(`Processing ${results.length} tool results`);
    }

    await agent.handleToolCallResults(ctx, results, this.memory);

    // Check if we should continue or return final response
    const directResult = results.find((r) => r.returnDirect);
    if (directResult) {
      // Get direct result
      const output =
        typeof directResult.toolOutput.output === "string"
          ? directResult.toolOutput.output
          : JSON.stringify(directResult.toolOutput.output);

      // Create an output object to finalize
      const agentOutput = {
        response: {
          role: "assistant" as const,
          content: output,
        },
        toolCalls: [],
        raw: output,
        currentAgentName: agent.name,
      };

      // Finalize the agent to add scratchpad to memory
      await agent.finalize(ctx, agentOutput, this.memory);

      return new StopEvent({
        result: output,
      });
    }

    // Continue with another agent step
    const messages = await this.memory.getMessages();
    return new AgentInput({
      input: messages,
      currentAgentName: agent.name,
    });
  };

  private setupWorkflowSteps(): this {
    this.workflow.addStep(
      {
        inputs: [StartEvent],
        outputs: [AgentInput],
      },
      this.handleInputStep,
    );

    this.workflow.addStep(
      {
        inputs: [AgentInput],
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

  async run(input: string): Promise<string> {
    if (this.agents.size === 0) {
      throw new Error("No agents added to workflow");
    }

    // Ensure workflow steps are set up
    this.setupWorkflowSteps();

    // Initialize the context data with a scratchpad array
    const contextData: AgentWorkflowContext = {
      query: input,
      scratchpad: [],
    };

    // Run the workflow with initialized context data
    const result = await this.workflow.run(input, contextData);

    // Return result
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (result as any).data.result || result.data;
  }
}
