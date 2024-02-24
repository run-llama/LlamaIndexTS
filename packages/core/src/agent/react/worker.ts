import { randomUUID } from "crypto";
import { CallbackManager } from "../../callbacks/CallbackManager.js";
import { AgentChatResponse } from "../../engines/chat/index.js";
import type { ChatResponse, LLM } from "../../llm/index.js";
import { OpenAI } from "../../llm/index.js";
import { ChatMemoryBuffer } from "../../memory/ChatMemoryBuffer.js";
import type { ObjectRetriever } from "../../objects/base.js";
import { ToolOutput } from "../../tools/index.js";
import type { BaseTool } from "../../types.js";
import type { AgentWorker, Task } from "../types.js";
import { TaskStep, TaskStepOutput } from "../types.js";
import { ReActChatFormatter } from "./formatter.js";
import { ReActOutputParser } from "./outputParser.js";
import type { BaseReasoningStep } from "./types.js";
import {
  ActionReasoningStep,
  ObservationReasoningStep,
  ResponseReasoningStep,
} from "./types.js";

type ReActAgentWorkerParams = {
  tools: BaseTool[];
  llm?: LLM;
  maxInteractions?: number;
  reactChatFormatter?: ReActChatFormatter | undefined;
  outputParser?: ReActOutputParser | undefined;
  callbackManager?: CallbackManager | undefined;
  verbose?: boolean | undefined;
  toolRetriever?: ObjectRetriever | undefined;
};

/**
 *
 * @param step
 * @param memory
 * @param currentReasoning
 * @param verbose
 */
function addUserStepToReasoning(
  step: TaskStep,
  memory: ChatMemoryBuffer,
  currentReasoning: BaseReasoningStep[],
  verbose: boolean = false,
): void {
  if (step.stepState.isFirst) {
    memory.put({
      content: step.input,
      role: "user",
    });
    step.stepState.isFirst = false;
  } else {
    const reasoningStep = new ObservationReasoningStep({
      observation: step.input ?? undefined,
    });
    currentReasoning.push(reasoningStep);
    if (verbose) {
      console.log(`Added user message to memory: ${step.input}`);
    }
  }
}

/**
 * ReAct agent worker.
 */
export class ReActAgentWorker implements AgentWorker {
  llm: LLM;
  verbose: boolean;

  maxInteractions: number = 10;
  reactChatFormatter: ReActChatFormatter;
  outputParser: ReActOutputParser;

  callbackManager: CallbackManager;

  _getTools: (message: string) => Promise<BaseTool[]>;

  constructor({
    tools,
    llm,
    maxInteractions,
    reactChatFormatter,
    outputParser,
    callbackManager,
    verbose,
    toolRetriever,
  }: ReActAgentWorkerParams) {
    this.llm = llm ?? new OpenAI({ model: "gpt-3.5-turbo-0613" });
    this.callbackManager = callbackManager || new CallbackManager();

    this.maxInteractions = maxInteractions ?? 10;
    this.reactChatFormatter = reactChatFormatter ?? new ReActChatFormatter();
    this.outputParser = outputParser ?? new ReActOutputParser();
    this.verbose = verbose || false;

    if (tools.length > 0 && toolRetriever) {
      throw new Error("Cannot specify both tools and tool_retriever");
    } else if (tools.length > 0) {
      this._getTools = async () => tools;
    } else if (toolRetriever) {
      this._getTools = async (message: string) =>
        toolRetriever.retrieve(message);
    } else {
      this._getTools = async () => [];
    }
  }

  /**
   * Initialize a task step.
   * @param task - task
   * @param kwargs - keyword arguments
   * @returns - task step
   */
  initializeStep(task: Task, kwargs?: any): TaskStep {
    const sources: ToolOutput[] = [];
    const currentReasoning: BaseReasoningStep[] = [];
    const newMemory = new ChatMemoryBuffer();

    const taskState = {
      sources,
      currentReasoning,
      newMemory,
    };

    task.extraState = {
      ...task.extraState,
      ...taskState,
    };

    return new TaskStep(task.taskId, randomUUID(), task.input, {
      isFirst: true,
    });
  }

  /**
   * Extract reasoning step from chat response.
   * @param output - chat response
   * @param isStreaming - whether the chat response is streaming
   * @returns - [message content, reasoning steps, is done]
   */
  extractReasoningStep(
    output: ChatResponse,
    isStreaming: boolean,
  ): [string, BaseReasoningStep[], boolean] {
    if (!output.message.content) {
      throw new Error("Got empty message.");
    }

    const messageContent = output.message.content;
    const currentReasoning: BaseReasoningStep[] = [];

    let reasoningStep;

    try {
      reasoningStep = this.outputParser.parse(
        messageContent,
        isStreaming,
      ) as ActionReasoningStep;
    } catch (e) {
      throw new Error(`Could not parse output: ${e}`);
    }

    if (this.verbose) {
      console.log(`${reasoningStep.getContent()}\n`);
    }

    currentReasoning.push(reasoningStep);

    if (reasoningStep.isDone()) {
      return [messageContent, currentReasoning, true];
    }

    const actionReasoningStep = new ActionReasoningStep({
      thought: reasoningStep.getContent(),
      action: reasoningStep.action,
      actionInput: reasoningStep.actionInput,
    });

    if (!(actionReasoningStep instanceof ActionReasoningStep)) {
      throw new Error(`Expected ActionReasoningStep, got ${reasoningStep}`);
    }

    return [messageContent, currentReasoning, false];
  }

  /**
   * Process actions.
   * @param task - task
   * @param tools - tools
   * @param output - chat response
   * @param isStreaming - whether the chat response is streaming
   * @returns - [reasoning steps, is done]
   */
  async _processActions(
    task: Task,
    tools: BaseTool[],
    output: ChatResponse,
    isStreaming: boolean = false,
  ): Promise<[BaseReasoningStep[], boolean]> {
    const toolsDict: Record<string, BaseTool> = {};

    for (const tool of tools) {
      toolsDict[tool.metadata.name] = tool;
    }

    const [_, currentReasoning, isDone] = this.extractReasoningStep(
      output,
      isStreaming,
    );

    if (isDone) {
      return [currentReasoning, true];
    }

    const reasoningStep = currentReasoning[
      currentReasoning.length - 1
    ] as ActionReasoningStep;

    const actionReasoningStep = new ActionReasoningStep({
      thought: reasoningStep.getContent(),
      action: reasoningStep.action,
      actionInput: reasoningStep.actionInput,
    });

    const tool = toolsDict[actionReasoningStep.action];

    const toolOutput = await tool?.call?.(actionReasoningStep.actionInput);

    task.extraState.sources.push(
      new ToolOutput(
        toolOutput,
        tool.metadata.name,
        actionReasoningStep.actionInput,
        toolOutput,
      ),
    );

    const observationStep = new ObservationReasoningStep({
      observation: toolOutput,
    });

    currentReasoning.push(observationStep);

    if (this.verbose) {
      console.log(`${observationStep.getContent()}`);
    }

    return [currentReasoning, false];
  }

  /**
   * Get response.
   * @param currentReasoning - current reasoning steps
   * @param sources - tool outputs
   * @returns - agent chat response
   */
  _getResponse(
    currentReasoning: BaseReasoningStep[],
    sources: ToolOutput[],
  ): AgentChatResponse {
    if (currentReasoning.length === 0) {
      throw new Error("No reasoning steps were taken.");
    } else if (currentReasoning.length === this.maxInteractions) {
      throw new Error("Reached max iterations.");
    }

    const responseStep = currentReasoning[currentReasoning.length - 1];

    let responseStr: string;

    if (responseStep instanceof ResponseReasoningStep) {
      responseStr = responseStep.response;
    } else {
      responseStr = responseStep.getContent();
    }

    return new AgentChatResponse(responseStr, sources);
  }

  /**
   * Get task step response.
   * @param agentResponse - agent chat response
   * @param step - task step
   * @param isDone - whether the task is done
   * @returns - task step output
   */
  _getTaskStepResponse(
    agentResponse: AgentChatResponse,
    step: TaskStep,
    isDone: boolean,
  ): TaskStepOutput {
    let newSteps: TaskStep[] = [];

    if (isDone) {
      newSteps = [];
    } else {
      newSteps = [step.getNextStep(randomUUID(), undefined)];
    }

    return new TaskStepOutput(agentResponse, step, newSteps, isDone);
  }

  /**
   * Run a task step.
   * @param step - task step
   * @param task - task
   * @param kwargs - keyword arguments
   * @returns - task step output
   */
  async _runStep(
    step: TaskStep,
    task: Task,
    kwargs?: any,
  ): Promise<TaskStepOutput> {
    if (step.input) {
      addUserStepToReasoning(
        step,
        task.extraState.newMemory,
        task.extraState.currentReasoning,
        this.verbose,
      );
    }

    const tools = await this._getTools(task.input);

    const inputChat = this.reactChatFormatter.format(
      tools,
      [...task.memory.getAll(), ...task.extraState.newMemory.getAll()],
      task.extraState.currentReasoning,
    );

    const chatResponse = await this.llm.chat({
      messages: inputChat,
    });

    const [reasoningSteps, isDone] = await this._processActions(
      task,
      tools,
      chatResponse,
    );

    task.extraState.currentReasoning.push(...reasoningSteps);

    const agentResponse = this._getResponse(
      task.extraState.currentReasoning,
      task.extraState.sources,
    );

    if (isDone) {
      task.extraState.newMemory.put({
        content: agentResponse.response,
        role: "assistant",
      });
    }

    return this._getTaskStepResponse(agentResponse, step, isDone);
  }

  /**
   * Run a task step.
   * @param step - task step
   * @param task - task
   * @param kwargs - keyword arguments
   * @returns - task step output
   */
  async runStep(
    step: TaskStep,
    task: Task,
    kwargs?: any,
  ): Promise<TaskStepOutput> {
    return await this._runStep(step, task);
  }

  /**
   * Run a task step.
   * @param step - task step
   * @param task - task
   * @param kwargs - keyword arguments
   * @returns - task step output
   */
  streamStep(
    step: TaskStep,
    task: Task,
    kwargs?: any,
  ): Promise<TaskStepOutput> {
    throw new Error("Method not implemented.");
  }

  /**
   * Finalize a task.
   * @param task - task
   * @param kwargs - keyword arguments
   */
  finalizeTask(task: Task, kwargs?: any): void {
    task.memory.set(task.memory.get() + task.extraState.newMemory.get());
    task.extraState.newMemory.reset();
  }
}
