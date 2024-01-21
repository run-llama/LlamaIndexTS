import { CallbackManager } from "../../callbacks/CallbackManager";
import { AgentChatResponse, ChatResponseMode } from "../../engines/chat";
import { ChatMessage, LLM } from "../../llm";
import {
  AgentWorker,
  BaseAgent,
  Task,
  TaskStep,
  TaskStepOutput,
} from "../types";

const validateStepFromArgs = (
  taskId: string,
  input: string,
  step?: any,
  kwargs?: any,
): TaskStep | undefined => {
  if (step) {
    if (input) {
      throw new Error("Cannot specify both `step` and `input`");
    }
    return step;
  } else {
    return new TaskStep(taskId, step, input, ...kwargs);
  }
};

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
    kwargs?: any,
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

export class TaskState {
  task!: Task;
  stepQueue!: TaskStep[];
  completedSteps!: TaskStepOutput[];

  constructor(init?: Partial<TaskState>) {
    Object.assign(this, init);
  }
}

class AgentState {
  taskDict!: Record<string, TaskState>;

  constructor(init?: Partial<AgentState>) {
    Object.assign(this, init);
  }

  getTask(taskId: string): Task {
    return this.taskDict[taskId].task;
  }

  getCompletedSteps(taskId: string): TaskStepOutput[] {
    return this.taskDict[taskId].completedSteps;
  }

  getStepQueue(taskId: string): TaskStep[] {
    return this.taskDict[taskId].stepQueue;
  }
}

type AgentRunnerParams = {
  agentWorker: AgentWorker;
  chatHistory?: ChatMessage[];
  state: AgentState;
  memory?: any;
  llm?: LLM;
  callbackManager?: CallbackManager;
  initTaskStateKwargs?: Record<string, any>;
  deleteTaskOnFinish?: boolean;
  defaultToolChoice?: string;
};
export abstract class AgentRunner extends BaseAgentRunner {
  agentWorker: AgentWorker;
  state: AgentState;
  memory: any;
  callbackManager: CallbackManager;
  initTaskStateKwargs: Record<string, any>;
  deleteTaskOnFinish: boolean;
  defaultToolChoice: string;

  /**
   * Creates an AgentRunner.
   */
  constructor(params: AgentRunnerParams) {
    super();

    this.agentWorker = params.agentWorker;
    this.state = params.state ?? new AgentState();
    this.memory = params.memory ?? {};
    this.callbackManager = params.callbackManager ?? new CallbackManager();
    this.initTaskStateKwargs = params.initTaskStateKwargs ?? {};
    this.deleteTaskOnFinish = params.deleteTaskOnFinish ?? false;
    this.defaultToolChoice = params.defaultToolChoice ?? "default";
  }

  /**
   * Creates a task.
   * @param input
   * @param kwargs
   */
  createTask(input: string, kwargs: any): Task {
    let extraState = kwargs["extraState"] ?? {};

    if (!this.initTaskStateKwargs) {
      delete extraState["extraState"];
    } else {
      if ("extraState" in kwargs) {
        throw new Error(
          "Cannot specify both `extraState` and `initTaskStateKwargs`",
        );
      } else {
        extraState = this.initTaskStateKwargs;
      }
    }

    const task = new Task({
      input,
      memory: this.memory,
      extraState,
      ...kwargs,
    });

    const initialStep = this.agentWorker.initializeStep(task);

    const taskState = new TaskState({
      task,
      stepQueue: [initialStep],
    });

    this.state.taskDict[task.taskId] = taskState;

    return task;
  }

  /**
   * Deletes the task.
   * @param taskId
   */
  deleteTask(taskId: string): void {
    delete this.state.taskDict[taskId];
  }

  /**
   * Returns the list of tasks.
   */
  listTasks(): Task[] {
    return Object.values(this.state.taskDict).map(
      (taskState) => taskState.task,
    );
  }

  /**
   * Returns the task.
   */
  getTask(taskId: string): Task {
    return this.state.taskDict[taskId].task;
  }

  /**
   * Returns the completed steps in the task.
   * @param taskId
   * @param kwargs
   */
  getCompletedSteps(taskId: string): TaskStepOutput[] {
    return this.state.taskDict[taskId].completedSteps;
  }

  /**
   * Returns the next steps in the task.
   * @param taskId
   * @param kwargs
   */
  getUpcomingSteps(taskId: string, kwargs: any): TaskStep[] {
    return this.state.taskDict[taskId].stepQueue;
  }

  private _runStep(
    taskId: string,
    step?: TaskStep,
    mode?: ChatResponseMode,
    kwargs?: any,
  ): TaskStepOutput {
    const task = this.state.getTask(taskId);
    const stepQueue = this.state.getStepQueue(taskId);
    const curStep = step || stepQueue.shift();

    let curStepOutput;

    if (!curStep) {
      throw new Error(`No step found for task ${taskId}`);
    }

    if (mode === ChatResponseMode.WAIT) {
      curStepOutput = this.agentWorker.runStep(curStep, task, kwargs);
    } else if (mode === ChatResponseMode.STREAM) {
      curStepOutput = this.agentWorker.streamStep(curStep, task, kwargs);
    } else {
      throw new Error(`Invalid mode: ${mode}`);
    }

    const nextSteps = curStepOutput.nextSteps;
    stepQueue.push(...nextSteps);

    const completedSteps = this.state.getCompletedSteps(taskId);
    completedSteps.push(curStepOutput);

    return curStepOutput;
  }

  /**
   * Runs the next step in the task.
   * @param taskId
   * @param kwargs
   * @param step
   * @returns
   */
  async runStep(
    taskId: string,
    input: string,
    step?: TaskStep,
    kwargs?: any,
  ): Promise<TaskStepOutput> {
    const curStep = validateStepFromArgs(taskId, input, step, kwargs);
    return this._runStep(taskId, curStep, ChatResponseMode.WAIT, kwargs);
  }

  /**
   * Runs the step and returns the response.
   * @param taskId
   * @param input
   * @param step
   * @param kwargs
   */
  async streamStep(
    taskId: string,
    input: string,
    step?: TaskStep,
    kwargs?: any,
  ): Promise<TaskStepOutput> {
    const curStep = validateStepFromArgs(taskId, input, step, kwargs);
    return this._runStep(taskId, curStep, ChatResponseMode.STREAM, kwargs);
  }

  /**
   * Finalizes the response and returns it.
   * @param taskId
   * @param kwargs
   * @param stepOutput
   * @returns
   */
  async finalizeResponse(
    taskId: string,
    stepOutput: TaskStepOutput,
    kwargs: any,
  ): Promise<AgentChatResponse> {
    if (!stepOutput) {
      stepOutput =
        this.getCompletedSteps(taskId)[
          this.getCompletedSteps(taskId).length - 1
        ];
    }
    if (!stepOutput.isLast) {
      throw new Error(
        "finalizeResponse can only be called on the last step output",
      );
    }

    if (!(stepOutput.output instanceof AgentChatResponse)) {
      throw new Error(
        `When \`isLast\` is True, cur_step_output.output must be AGENT_CHAT_RESPONSE_TYPE: ${stepOutput.output}`,
      );
    }

    this.agentWorker.finalizeTask(this.getTask(taskId), kwargs);

    if (this.deleteTaskOnFinish) {
      this.deleteTask(taskId);
    }

    return stepOutput.output;
  }
}
