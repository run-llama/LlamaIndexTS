import {
  BaseQueryEngine,
  QueryEngineParamsNonStreaming,
  QueryEngineParamsStreaming,
} from "../QueryEngine";
import { Response } from "../Response";
import {
  ChatEngine,
  ChatEngineParamsNonStreaming,
  ChatEngineParamsStreaming,
} from "../engines/chat";

/**
 * BaseAgent is the base class for all agents.
 */
export abstract class BaseAgent implements BaseQueryEngine, ChatEngine {
  protected _getPrompts(): string[] {
    return [];
  }

  protected _getPromptModules(): string[] {
    return [];
  }

  chat(params: ChatEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  chat(params: ChatEngineParamsNonStreaming): Promise<Response>;
  chat(params: any): Promise<AsyncIterable<Response>> | Promise<Response> {
    throw new Error("Method not implemented.");
  }

  reset(): void {
    throw new Error("Method not implemented.");
  }

  /**
   * query is the main entrypoint for the agent. It takes a query and returns a response.
   * @param params
   * @returns
   */
  async query(params: QueryEngineParamsNonStreaming): Promise<Response>;
  async query(
    params: QueryEngineParamsStreaming,
  ): Promise<AsyncIterable<Response>>;
  async query(
    params: QueryEngineParamsNonStreaming | QueryEngineParamsStreaming,
  ): Promise<Response | AsyncIterable<Response>> {
    if ("stream" in params && params.stream) {
      // Handle streaming query
      const streamResponse = this.handleStreamingQuery(params);
      return streamResponse;
    } else {
      // Handle non-streaming query
      const agentResponse = await this.chat({
        message: params.query,
        stream: false,
        chatHistory: [],
      });

      return agentResponse;
    }
  }

  private async *handleStreamingQuery(
    params: QueryEngineParamsStreaming,
  ): AsyncIterable<Response> {
    throw new Error("Not implemented yet");
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
  input?: string;
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
  input?: string;
  stepState: Record<string, any> = {};
  nextSteps: Record<string, TaskStep> = {};
  prevSteps: Record<string, TaskStep> = {};
  isReady: boolean = true;

  constructor(
    taskId: string,
    stepId: string,
    input?: string,
    stepState?: Record<string, any>,
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

export abstract class AgentWorker {
  abstract initializeStep(task: Task, kwargs?: any): TaskStep;
  abstract runStep(step: TaskStep, task: Task, kwargs?: any): TaskStepOutput;
  abstract streamStep(step: TaskStep, task: Task, kwargs?: any): TaskStepOutput;
  abstract finalizeTask(task: Task, kwargs?: any): void;
}
