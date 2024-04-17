import type {
  AgentChatResponse,
  ChatEngineAgentParams,
  StreamingAgentChatResponse,
} from "../engines/chat/index.js";

import { toQueryBundle } from "../internal/utils.js";
import type { BaseMemory } from "../memory/types.js";
import type { QueryEngineParamsNonStreaming } from "../types.js";

export interface AgentWorker<ExtraParams extends object = object> {
  initializeStep(task: Task, params?: ExtraParams): TaskStep;
  runStep(
    step: TaskStep,
    task: Task,
    params?: ExtraParams,
  ): Promise<TaskStepOutput>;
  streamStep(
    step: TaskStep,
    task: Task,
    params?: ExtraParams,
  ): Promise<TaskStepOutput>;
  finalizeTask(task: Task, params?: ExtraParams): void;
}

interface BaseChatEngine {
  chat(
    params: ChatEngineAgentParams,
  ): Promise<AgentChatResponse | StreamingAgentChatResponse>;
}

interface BaseQueryEngine {
  query(
    params: QueryEngineParamsNonStreaming,
  ): Promise<AgentChatResponse | StreamingAgentChatResponse>;
}

/**
 * BaseAgent is the base class for all agents.
 */
export abstract class BaseAgent implements BaseChatEngine, BaseQueryEngine {
  protected _getPrompts(): string[] {
    return [];
  }

  protected _getPromptModules(): string[] {
    return [];
  }

  abstract chat(
    params: ChatEngineAgentParams,
  ): Promise<AgentChatResponse | StreamingAgentChatResponse>;

  abstract reset(): void;

  /**
   * query is the main entrypoint for the agent. It takes a query and returns a response.
   * @param params
   * @returns
   */
  async query(
    params: QueryEngineParamsNonStreaming,
  ): Promise<AgentChatResponse | StreamingAgentChatResponse> {
    // Handle non-streaming query
    const agentResponse = await this.chat({
      message: toQueryBundle(params.query).query,
      chatHistory: [],
    });

    return agentResponse;
  }
}

type TaskParams = {
  taskId: string;
  input: string;
  memory: BaseMemory;
  extraState: Record<string, any>;
};

/**
 * Task is a unit of work for the agent.
 * @param taskId: taskId
 */
export class Task {
  taskId: string;
  input: string;

  memory: BaseMemory;
  extraState: Record<string, any>;

  constructor({ taskId, input, memory, extraState }: TaskParams) {
    this.taskId = taskId;
    this.input = input;
    this.memory = memory;
    this.extraState = extraState ?? {};
  }
}

interface ITaskStep {
  taskId: string;
  stepId: string;
  input?: string | null;
  stepState: Record<string, any>;
  nextSteps: Record<string, TaskStep>;
  prevSteps: Record<string, TaskStep>;
  isReady: boolean;
  getNextStep(
    stepId: string,
    input?: string,
    stepState?: Record<string, any>,
  ): TaskStep;
  linkStep(nextStep: TaskStep): void;
}

/**
 * TaskStep is a unit of work for the agent.
 * @param taskId: taskId
 * @param stepId: stepId
 * @param input: input
 * @param stepState: stepState
 */
export class TaskStep implements ITaskStep {
  taskId: string;
  stepId: string;
  input?: string | null;
  stepState: Record<string, any> = {};
  nextSteps: Record<string, TaskStep> = {};
  prevSteps: Record<string, TaskStep> = {};
  isReady: boolean = true;

  constructor(
    taskId: string,
    stepId: string,
    input?: string | null,
    stepState?: Record<string, any> | null,
  ) {
    this.taskId = taskId;
    this.stepId = stepId;
    this.input = input;
    this.stepState = stepState ?? this.stepState;
  }

  /*
   * getNextStep is a function that returns the next step.
   * @param stepId: stepId
   * @param input: input
   * @param stepState: stepState
   * @returns: TaskStep
   */
  getNextStep(
    stepId: string,
    input?: string,
    stepState?: Record<string, unknown>,
  ): TaskStep {
    return new TaskStep(
      this.taskId,
      stepId,
      input,
      stepState ?? this.stepState,
    );
  }

  /*
   * linkStep is a function that links the next step.
   * @param nextStep: nextStep
   * @returns: void
   */
  linkStep(nextStep: TaskStep): void {
    this.nextSteps[nextStep.stepId] = nextStep;
    nextStep.prevSteps[this.stepId] = this;
  }
}

/**
 * TaskStepOutput is a unit of work for the agent.
 * @param output: output
 * @param taskStep: taskStep
 * @param nextSteps: nextSteps
 * @param isLast: isLast
 */
export class TaskStepOutput {
  output: AgentChatResponse | StreamingAgentChatResponse;
  taskStep: TaskStep;
  nextSteps: TaskStep[];
  isLast: boolean;

  constructor(
    output: AgentChatResponse | StreamingAgentChatResponse,
    taskStep: TaskStep,
    nextSteps: TaskStep[],
    isLast: boolean = false,
  ) {
    this.output = output;
    this.taskStep = taskStep;
    this.nextSteps = nextSteps;
    this.isLast = isLast;
  }

  toString(): string {
    return String(this.output);
  }
}
