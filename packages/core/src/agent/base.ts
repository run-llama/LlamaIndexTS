import { pipeline, randomUUID } from "@llamaindex/env";
import {
  AgentChatResponse,
  type ChatEngineParamsNonStreaming,
  type ChatEngineParamsStreaming,
} from "../engines/chat/index.js";
import { wrapEventCaller } from "../internal/context/EventCaller.js";
import type {
  ChatMessage,
  ChatResponse,
  LLM,
  ToolCallLLMMessageOptions,
} from "../llm/index.js";
import { extractText } from "../llm/utils.js";
import type { BaseTool, BaseToolWithCall, UUID } from "../types.js";

export const MAX_TOOL_CALLS = 10;

export type ToolOutput = {
  tool: BaseTool | undefined;
  input: unknown;
  output: string;
  isError: boolean;
};

export type AgentTaskContext<
  Model extends LLM,
  AdditionalMessageOptions extends object = Model extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
> = {
  readonly stream: boolean;
  toolCallCount: number;
  llm: Model;
  tools: BaseToolWithCall[];
  toolOutputs: ToolOutput[];
  messages: ChatMessage<AdditionalMessageOptions>[];
  shouldContinue: (
    taskStep: TaskStep<Model, AdditionalMessageOptions>,
  ) => boolean;
};

export type TaskStep<
  Model extends LLM,
  AdditionalMessageOptions extends object = Model extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
> = {
  id: UUID;
  input: ChatMessage<AdditionalMessageOptions>;
  context: AgentTaskContext<Model, AdditionalMessageOptions>;

  // linked list
  prevStep: TaskStep<Model, AdditionalMessageOptions> | null;
};

export type TaskStepOutput<
  Model extends LLM,
  AdditionalMessageOptions extends object = Model extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
> = {
  taskStep: TaskStep<Model, AdditionalMessageOptions>;
  output: ChatResponse<AdditionalMessageOptions>;
  isLast: boolean;
};

export type TaskHandler<
  Model extends LLM,
  AdditionalMessageOptions extends object = Model extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
> = (
  step: TaskStep<Model, AdditionalMessageOptions>,
) => Promise<TaskStepOutput<Model, AdditionalMessageOptions>>;

/**
 * @internal
 */
export async function* createTaskImpl<
  Model extends LLM,
  AdditionalMessageOptions extends object = Model extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
>(
  handler: TaskHandler<Model, AdditionalMessageOptions>,
  context: AgentTaskContext<Model, AdditionalMessageOptions>,
  input: ChatMessage<AdditionalMessageOptions>,
): AsyncGenerator<TaskStepOutput<Model, AdditionalMessageOptions>> {
  let isDone = false;
  let prevStep: TaskStep<Model, AdditionalMessageOptions> | null = null;
  while (!isDone) {
    const step: TaskStep<Model, AdditionalMessageOptions> = {
      id: randomUUID(),
      input,
      context,
      prevStep,
    };
    const prevToolCallCount = step.context.toolCallCount;
    // todo: handle case tool call count over limit
    const taskOutput = await handler(step);
    const { isLast, output, taskStep } = taskOutput;
    input = output.message;
    context = {
      ...taskStep.context,
      toolCallCount: prevToolCallCount + 1,
    };
    if (isLast) {
      isDone = true;
    }
    prevStep = taskStep;
    yield taskOutput;
  }
}

export abstract class AgentRunner<
  AI extends LLM,
  AdditionalMessageOptions extends object = AI extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
> {
  readonly #llm: AI;
  readonly #tools:
    | BaseToolWithCall[]
    | ((query: string) => Promise<BaseToolWithCall[]>) = [];
  #chatHistory: ChatMessage<AdditionalMessageOptions>[];
  readonly #runner: AgentWorker<AI, AdditionalMessageOptions>;

  protected constructor(
    llm: AI,
    chatHistory: ChatMessage<AdditionalMessageOptions>[],
    runner: AgentWorker<AI, AdditionalMessageOptions>,
    tools:
      | BaseToolWithCall[]
      | ((query: string) => Promise<BaseToolWithCall[]>)
      | undefined,
  ) {
    this.#llm = llm;
    this.#chatHistory = chatHistory;
    this.#runner = runner;
    if (tools) {
      this.#tools = tools;
    }
  }

  get llm() {
    return this.#llm;
  }

  get chatHistory(): ChatMessage<ToolCallLLMMessageOptions>[] {
    return this.#chatHistory;
  }

  public reset(): void {
    this.#chatHistory = [];
  }

  public getTools(
    query: string,
  ): Promise<BaseToolWithCall[]> | BaseToolWithCall[] {
    return typeof this.#tools === "function" ? this.#tools(query) : this.#tools;
  }

  static shouldContinue(task: TaskStep<LLM, object>): boolean {
    return task.context.toolCallCount < MAX_TOOL_CALLS;
  }

  @wrapEventCaller
  async chat(
    params: ChatEngineParamsNonStreaming | ChatEngineParamsStreaming,
  ): Promise<Promise<AgentChatResponse>> {
    const task = await this.#runner.createTask(extractText(params.message), {
      stream: !!params.stream,
      toolCallCount: 0,
      llm: this.#llm,
      tools: await this.getTools(extractText(params.message)),
      toolOutputs: [],
      messages: [...this.#chatHistory],
      shouldContinue: AgentRunner.shouldContinue,
    });
    const stepOutput = await pipeline(task, async (iter) => {
      for await (const stepOutput of iter) {
        if (stepOutput.isLast) {
          return stepOutput;
        }
      }
      throw new Error("Task did not complete");
    });
    const { output, taskStep } = stepOutput;
    this.#chatHistory = [...taskStep.context.messages];
    return new AgentChatResponse(extractText(output.message.content));
  }
}

export abstract class AgentWorker<
  AI extends LLM,
  AdditionalMessageOptions extends object = AI extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
> {
  abstract createTask(
    query: string,
    context?: AgentTaskContext<AI, AdditionalMessageOptions>,
  ): Promise<AsyncGenerator<TaskStepOutput<AI, AdditionalMessageOptions>>>;
}
