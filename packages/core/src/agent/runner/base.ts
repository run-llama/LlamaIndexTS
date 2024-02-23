import { randomUUID } from "crypto";
import { CallbackManager } from "../../callbacks/CallbackManager.js";
import {
  AgentChatResponse,
  ChatEngineAgentParams,
  ChatResponseMode,
} from "../../engines/chat/index.js";
import { ChatMessage, LLM } from "../../llm/index.js";
import { ChatMemoryBuffer } from "../../memory/ChatMemoryBuffer.js";
import { BaseMemory } from "../../memory/types.js";
import { AgentWorker, Task, TaskStep, TaskStepOutput } from "../types.js";
import { AgentState, BaseAgentRunner, TaskState } from "./types.js";

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
    return new TaskStep(taskId, step, input, kwargs);
  }
};

type AgentRunnerParams = {
  agentWorker: AgentWorker;
  chatHistory?: ChatMessage[];
  state?: AgentState;
  memory?: BaseMemory;
  llm?: LLM;
  callbackManager?: CallbackManager;
  initTaskStateKwargs?: Record<string, any>;
  deleteTaskOnFinish?: boolean;
  defaultToolChoice?: string;
};

export class AgentRunner extends BaseAgentRunner {
  agentWorker: AgentWorker;
  state: AgentState;
  memory: BaseMemory;
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
    this.memory =
      params.memory ??
      new ChatMemoryBuffer({
        chatHistory: params.chatHistory,
      });
    this.callbackManager = params.callbackManager ?? new CallbackManager();
    this.initTaskStateKwargs = params.initTaskStateKwargs ?? {};
    this.deleteTaskOnFinish = params.deleteTaskOnFinish ?? false;
    this.defaultToolChoice = params.defaultToolChoice ?? "auto";
  }

  /**
   * Creates a task.
   * @param input
   * @param kwargs
   */
  createTask(input: string, kwargs?: any): Task {
    let extraState;

    if (!this.initTaskStateKwargs) {
      if (kwargs && "extraState" in kwargs) {
        if (extraState) {
          delete extraState["extraState"];
        }
      }
    } else {
      if (kwargs && "extraState" in kwargs) {
        throw new Error(
          "Cannot specify both `extraState` and `initTaskStateKwargs`",
        );
      } else {
        extraState = this.initTaskStateKwargs;
      }
    }

    const task = new Task({
      taskId: randomUUID(),
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

  private async _runStep(
    taskId: string,
    step?: TaskStep,
    mode: ChatResponseMode = ChatResponseMode.WAIT,
    kwargs?: any,
  ): Promise<TaskStepOutput> {
    const task = this.state.getTask(taskId);
    const curStep = step || this.state.getStepQueue(taskId).shift();

    let curStepOutput;

    if (!curStep) {
      throw new Error(`No step found for task ${taskId}`);
    }

    if (mode === ChatResponseMode.WAIT) {
      curStepOutput = await this.agentWorker.runStep(curStep, task, kwargs);
    } else if (mode === ChatResponseMode.STREAM) {
      curStepOutput = await this.agentWorker.streamStep(curStep, task, kwargs);
    } else {
      throw new Error(`Invalid mode: ${mode}`);
    }

    const nextSteps = curStepOutput.nextSteps;

    this.state.addSteps(taskId, nextSteps);
    this.state.addCompletedStep(taskId, [curStepOutput]);

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
    kwargs: any = {},
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
    kwargs?: any,
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

  protected async _chat({
    message,
    toolChoice,
  }: ChatEngineAgentParams & { mode: ChatResponseMode }) {
    const task = this.createTask(message as string);

    let resultOutput;

    while (true) {
      const curStepOutput = await this._runStep(
        task.taskId,
        undefined,
        ChatResponseMode.WAIT,
        {
          toolChoice,
        },
      );

      if (curStepOutput.isLast) {
        resultOutput = curStepOutput;
        break;
      }

      toolChoice = "auto";
    }

    return this.finalizeResponse(task.taskId, resultOutput);
  }

  /**
   * Sends a message to the LLM and returns the response.
   * @param message
   * @param chatHistory
   * @param toolChoice
   * @returns
   */
  public async chat({
    message,
    chatHistory,
    toolChoice,
  }: ChatEngineAgentParams): Promise<AgentChatResponse> {
    if (!toolChoice) {
      toolChoice = this.defaultToolChoice;
    }

    const chatResponse = await this._chat({
      message,
      chatHistory,
      toolChoice,
      mode: ChatResponseMode.WAIT,
    });

    return chatResponse;
  }

  protected _getPromptModules(): string[] {
    return [];
  }

  protected _getPrompts(): string[] {
    return [];
  }

  /**
   * Resets the agent.
   */
  reset(): void {
    this.state = new AgentState();
  }

  getCompletedStep(
    taskId: string,
    stepId: string,
    kwargs: any,
  ): TaskStepOutput {
    const completedSteps = this.getCompletedSteps(taskId);
    for (const stepOutput of completedSteps) {
      if (stepOutput.taskStep.stepId === stepId) {
        return stepOutput;
      }
    }

    throw new Error(`Step ${stepId} not found in task ${taskId}`);
  }

  /**
   * Undoes the step.
   * @param taskId
   */
  undoStep(taskId: string): void {}
}
