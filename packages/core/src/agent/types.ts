import {
  BaseQueryEngine,
  QueryEngineParamsNonStreaming,
  QueryEngineParamsStreaming,
} from "../QueryEngine";
import { Response } from "../Response";
import { SimpleChatEngine } from "../engines/chat";

/**
 * BaseAgent is the base class for all agents.
 */
export abstract class BaseAgent
  extends SimpleChatEngine
  implements BaseQueryEngine
{
  protected _getPrompts(): string[] {
    return [];
  }

  protected _getPromptModules(): string[] {
    return [];
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

export abstract class Task {
  taskId!: string;
  input!: string;

  memory: any;
  extraState!: Record<string, unknown>;
}

interface ITaskStep {
  taskId: string;
  stepId: string;
  input?: string;
  stepState: Record<string, unknown>;
  nextSteps: Record<string, TaskStep>;
  prevSteps: Record<string, TaskStep>;
  isReady: boolean;
  getNextStep(
    stepId: string,
    input?: string,
    stepState?: Record<string, unknown>,
  ): TaskStep;
  linkStep(nextStep: TaskStep): void;
}

export class TaskStep implements ITaskStep {
  taskId: string;
  stepId: string;
  input?: string;
  stepState: Record<string, unknown> = {};
  nextSteps: Record<string, TaskStep> = {};
  prevSteps: Record<string, TaskStep> = {};
  isReady: boolean = true;

  constructor(
    taskId: string,
    stepId: string,
    input?: string,
    stepState?: Record<string, unknown>,
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
