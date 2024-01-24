import { QueryEngineParamsNonStreaming } from "../QueryEngine";

import { AgentChatResponse, ChatEngineAgentParams } from "../engines/chat";

interface BaseChatEngine {
  chat(params: ChatEngineAgentParams): Promise<AgentChatResponse>;
}

interface BaseQueryEngine {
  query(params: QueryEngineParamsNonStreaming): Promise<AgentChatResponse>;
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

  abstract chat(params: ChatEngineAgentParams): Promise<AgentChatResponse>;
  abstract reset(): void;

  /**
   * query is the main entrypoint for the agent. It takes a query and returns a response.
   * @param params
   * @returns
   */
  async query(
    params: QueryEngineParamsNonStreaming,
  ): Promise<AgentChatResponse> {
    // Handle non-streaming query
    const agentResponse = await this.chat({
      message: params.query,
      chatHistory: [],
    });

    return agentResponse;
  }
}

type TaskParams = {
  taskId: string;
  input: string;
  memory: any;
  extraState: Record<string, any>;
};

export class Task {
  taskId!: string;
  input!: string;

  memory: any;
  extraState!: Record<string, any>;

  constructor({ taskId, input, memory, extraState }: TaskParams) {
    this.taskId = taskId;
    this.input = input;
    this.memory = memory;
    this.extraState = extraState;
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

  linkStep(nextStep: TaskStep): void {
    this.nextSteps[nextStep.stepId] = nextStep;
    nextStep.prevSteps[this.stepId] = this;
  }
}

export class TaskStepOutput {
  output: unknown;
  taskStep: TaskStep;
  nextSteps: TaskStep[];
  isLast: boolean;

  constructor(
    output: unknown,
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

export interface AgentWorker {
  initializeStep(task: Task, kwargs?: any): TaskStep;
  runStep(step: TaskStep, task: Task, kwargs?: any): Promise<TaskStepOutput>;
  streamStep(step: TaskStep, task: Task, kwargs?: any): Promise<TaskStepOutput>;
  finalizeTask(task: Task, kwargs?: any): void;
}
