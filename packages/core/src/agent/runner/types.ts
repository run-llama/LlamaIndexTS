import { AgentChatResponse } from "../../engines/chat/index.js";
import { BaseAgent, Task, TaskStep, TaskStepOutput } from "../types.js";

export class TaskState {
  task!: Task;
  stepQueue!: TaskStep[];
  completedSteps!: TaskStepOutput[];

  constructor(init?: Partial<TaskState>) {
    Object.assign(this, init);
  }
}

export abstract class BaseAgentRunner extends BaseAgent {
  constructor(init?: Partial<BaseAgentRunner>) {
    super();
  }

  abstract createTask(input: string, kwargs: any): Task;
  abstract deleteTask(taskId: string): void;
  abstract getTask(taskId: string, kwargs: any): Task;
  abstract listTasks(kwargs: any): Task[];
  abstract getUpcomingSteps(taskId: string, kwargs: any): TaskStep[];
  abstract getCompletedSteps(taskId: string, kwargs: any): TaskStepOutput[];

  getCompletedStep(
    taskId: string,
    stepId: string,
    kwargs: any,
  ): TaskStepOutput {
    const completedSteps = this.getCompletedSteps(taskId, kwargs);
    for (const stepOutput of completedSteps) {
      if (stepOutput.taskStep.stepId === stepId) {
        return stepOutput;
      }
    }

    throw new Error(`Step ${stepId} not found in task ${taskId}`);
  }

  abstract runStep(
    taskId: string,
    input: string,
    step: TaskStep,
    kwargs: any,
  ): Promise<TaskStepOutput>;

  abstract streamStep(
    taskId: string,
    input: string,
    step: TaskStep,
    kwargs?: any,
  ): Promise<TaskStepOutput>;

  abstract finalizeResponse(
    taskId: string,
    stepOutput: TaskStepOutput,
    kwargs?: any,
  ): Promise<AgentChatResponse>;

  abstract undoStep(taskId: string): void;
}

export class AgentState {
  taskDict!: Record<string, TaskState>;

  constructor(init?: Partial<AgentState>) {
    Object.assign(this, init);

    if (!this.taskDict) {
      this.taskDict = {};
    }
  }

  getTask(taskId: string): Task {
    return this.taskDict[taskId].task;
  }

  getCompletedSteps(taskId: string): TaskStepOutput[] {
    return this.taskDict[taskId].completedSteps || [];
  }

  getStepQueue(taskId: string): TaskStep[] {
    return this.taskDict[taskId].stepQueue || [];
  }

  addSteps(taskId: string, steps: TaskStep[]): void {
    if (!this.taskDict[taskId].stepQueue) {
      this.taskDict[taskId].stepQueue = [];
    }

    this.taskDict[taskId].stepQueue.push(...steps);
  }

  addCompletedStep(taskId: string, stepOutputs: TaskStepOutput[]): void {
    if (!this.taskDict[taskId].completedSteps) {
      this.taskDict[taskId].completedSteps = [];
    }

    this.taskDict[taskId].completedSteps.push(...stepOutputs);
  }
}
