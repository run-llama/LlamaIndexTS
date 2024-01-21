import { BaseAgent, Task, TaskStep, TaskStepOutput } from "../types";

export abstract class BaseAgentRunner extends BaseAgent {
  constructor(init?: Partial<BaseAgentRunner>) {
    super(init);
  }

  abstract createTask(input: string, kwargs: unknown): Promise<Task>;
  abstract deleteTask(taskId: string): Promise<void>;
  abstract getTask(taskId: string, kwargs: unknown): Promise<Task>;
  abstract listTasks(kwargs: unknown): Promise<Task[]>;
  abstract getUpcomingSteps(
    taskId: string,
    kwargs: unknown,
  ): Promise<TaskStep[]>;
  abstract getCompletedSteps(taskId: string, kwargs: unknown): TaskStepOutput[];

  getCompletedStep(
    taskId: string,
    stepId: string,
    kwargs: unknown,
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
    stepId: string,
    input: string,
    kwargs: unknown,
  ): TaskStepOutput;

  abstract streamStep(
    taskId: string,
    stepId: string,
    input: string,
    kwargs: unknown,
  ): TaskStepOutput;

  abstract finalizeResponse(
    taskId: string,
    kwargs: unknown,
    stepOutput: TaskStepOutput,
  ): TaskStepOutput;

  abstract undoStep(taskId: string): void;
}
