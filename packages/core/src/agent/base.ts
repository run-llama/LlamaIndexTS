import { pipeline, randomUUID } from "@llamaindex/env";
import {
  type ChatEngine,
  type ChatEngineParamsNonStreaming,
  type ChatEngineParamsStreaming,
} from "../engines/chat/index.js";
import { wrapEventCaller } from "../internal/context/EventCaller.js";
import { getCallbackManager } from "../internal/settings/CallbackManager.js";
import { isAsyncIterable } from "../internal/utils.js";
import type {
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  LLM,
  MessageContent,
} from "../llm/index.js";
import { extractText } from "../llm/utils.js";
import type { BaseToolWithCall, ToolOutput, UUID } from "../types.js";
import { consumeAsyncIterable } from "./utils.js";

export const MAX_TOOL_CALLS = 10;

export type AgentTaskContext<
  Model extends LLM,
  Store extends object = {},
  AdditionalMessageOptions extends object = Model extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
> = {
  readonly stream: boolean;
  readonly toolCallCount: number;
  readonly llm: Model;
  readonly getTools: (
    input: MessageContent,
  ) => BaseToolWithCall[] | Promise<BaseToolWithCall[]>;
  shouldContinue: (
    taskStep: Readonly<TaskStep<Model, Store, AdditionalMessageOptions>>,
  ) => boolean;
  store: {
    toolOutputs: ToolOutput[];
    messages: ChatMessage<AdditionalMessageOptions>[];
  } & Store;
};

export type TaskStep<
  Model extends LLM,
  Store extends object = {},
  AdditionalMessageOptions extends object = Model extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
> = {
  id: UUID;
  input: ChatMessage<AdditionalMessageOptions> | null;
  context: AgentTaskContext<Model, Store, AdditionalMessageOptions>;

  // linked list
  prevStep: TaskStep<Model, Store, AdditionalMessageOptions> | null;
  nextSteps: Set<TaskStep<Model, Store, AdditionalMessageOptions>>;
};

export type TaskStepOutput<
  Model extends LLM,
  Store extends object = {},
  AdditionalMessageOptions extends object = Model extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
> =
  | {
      taskStep: TaskStep<Model, Store, AdditionalMessageOptions>;
      output:
        | null
        | ChatResponse<AdditionalMessageOptions>
        | ReadableStream<ChatResponseChunk<AdditionalMessageOptions>>;
      isLast: false;
    }
  | {
      taskStep: TaskStep<Model, Store, AdditionalMessageOptions>;
      output:
        | ChatResponse<AdditionalMessageOptions>
        | ReadableStream<ChatResponseChunk<AdditionalMessageOptions>>;
      isLast: true;
    };

export type TaskHandler<
  Model extends LLM,
  Store extends object = {},
  AdditionalMessageOptions extends object = Model extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
> = (
  step: TaskStep<Model, Store, AdditionalMessageOptions>,
) => Promise<TaskStepOutput<Model, Store, AdditionalMessageOptions>>;

/**
 * @internal
 */
export async function* createTaskImpl<
  Model extends LLM,
  Store extends object = {},
  AdditionalMessageOptions extends object = Model extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
>(
  handler: TaskHandler<Model, Store, AdditionalMessageOptions>,
  context: AgentTaskContext<Model, Store, AdditionalMessageOptions>,
  _input: ChatMessage<AdditionalMessageOptions>,
): AsyncGenerator<TaskStepOutput<Model, Store, AdditionalMessageOptions>> {
  let isDone = false;
  let input: ChatMessage<AdditionalMessageOptions> | null = _input;
  let prevStep: TaskStep<Model, Store, AdditionalMessageOptions> | null = null;
  while (!isDone) {
    const step: TaskStep<Model, Store, AdditionalMessageOptions> = {
      id: randomUUID(),
      input,
      context,
      prevStep,
      nextSteps: new Set(),
    };
    if (prevStep) {
      prevStep.nextSteps.add(step);
    }
    const prevToolCallCount = step.context.toolCallCount;
    if (!step.context.shouldContinue(step)) {
      throw new Error("Tool call count exceeded limit");
    }
    getCallbackManager().dispatchEvent("agent-start", {
      payload: {},
    });
    const taskOutput = await handler(step);
    const { isLast, output, taskStep } = taskOutput;
    // do not consume last output
    if (!isLast) {
      if (output) {
        input = isAsyncIterable(output)
          ? await consumeAsyncIterable(output)
          : output.message;
      } else {
        input = null;
      }
    }
    context = {
      ...taskStep.context,
      store: {
        ...taskStep.context.store,
      },
      toolCallCount: prevToolCallCount + 1,
    };
    if (isLast) {
      isDone = true;
      getCallbackManager().dispatchEvent("agent-end", {
        payload: {},
      });
    }
    prevStep = taskStep;
    yield taskOutput;
  }
}

export type AgentStreamChatResponse<Options extends object> = {
  response: ChatResponseChunk<Options>;
  // sources of the response, will emit when new tool outputs are available
  sources?: ToolOutput[];
};

export type AgentChatResponse<Options extends object> = {
  response: ChatResponse<Options>;
  sources: ToolOutput[];
};

export type AgentRunnerParams<
  AI extends LLM,
  Store extends object = {},
  AdditionalMessageOptions extends object = AI extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
> = {
  llm: AI;
  chatHistory: ChatMessage<AdditionalMessageOptions>[];
  systemPrompt: MessageContent | null;
  runner: AgentWorker<AI, Store, AdditionalMessageOptions>;
  tools:
    | BaseToolWithCall[]
    | ((query: MessageContent) => Promise<BaseToolWithCall[]>);
};

export type AgentParamsBase<
  AI extends LLM,
  AdditionalMessageOptions extends object = AI extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
> = {
  llm?: AI;
  chatHistory?: ChatMessage<AdditionalMessageOptions>[];
  systemPrompt?: MessageContent;
};

/**
 * Worker will schedule tasks and handle the task execution
 */
export abstract class AgentWorker<
  AI extends LLM,
  Store extends object = {},
  AdditionalMessageOptions extends object = AI extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
> {
  #taskSet = new Set<TaskStep<AI, Store, AdditionalMessageOptions>>();
  abstract taskHandler: TaskHandler<AI, Store, AdditionalMessageOptions>;

  public createTask(
    query: string,
    context: AgentTaskContext<AI, Store, AdditionalMessageOptions>,
  ): ReadableStream<TaskStepOutput<AI, Store, AdditionalMessageOptions>> {
    const taskGenerator = createTaskImpl(this.taskHandler, context, {
      role: "user",
      content: query,
    });
    return new ReadableStream<
      TaskStepOutput<AI, Store, AdditionalMessageOptions>
    >({
      start: async (controller) => {
        for await (const stepOutput of taskGenerator) {
          this.#taskSet.add(stepOutput.taskStep);
          controller.enqueue(stepOutput);
          if (stepOutput.isLast) {
            let currentStep: TaskStep<
              AI,
              Store,
              AdditionalMessageOptions
            > | null = stepOutput.taskStep;
            while (currentStep) {
              this.#taskSet.delete(currentStep);
              currentStep = currentStep.prevStep;
            }
            controller.close();
          }
        }
      },
    });
  }

  [Symbol.toStringTag] = "AgentWorker";
}

/**
 * Runner will manage the task execution and provide a high-level API for the user
 */
export abstract class AgentRunner<
  AI extends LLM,
  Store extends object = {},
  AdditionalMessageOptions extends object = AI extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
> implements
    ChatEngine<
      AgentChatResponse<AdditionalMessageOptions>,
      ReadableStream<AgentStreamChatResponse<AdditionalMessageOptions>>
    >
{
  readonly #llm: AI;
  readonly #tools:
    | BaseToolWithCall[]
    | ((query: MessageContent) => Promise<BaseToolWithCall[]>);
  readonly #systemPrompt: MessageContent | null = null;
  #chatHistory: ChatMessage<AdditionalMessageOptions>[];
  readonly #runner: AgentWorker<AI, Store, AdditionalMessageOptions>;

  // create extra store
  abstract createStore(): Store;

  static defaultCreateStore(): object {
    return Object.create(null);
  }

  protected constructor(
    params: AgentRunnerParams<AI, Store, AdditionalMessageOptions>,
  ) {
    const { llm, chatHistory, runner, tools } = params;
    this.#llm = llm;
    this.#chatHistory = chatHistory;
    this.#runner = runner;
    if (params.systemPrompt) {
      this.#systemPrompt = params.systemPrompt;
    }
    this.#tools = tools;
  }

  get llm() {
    return this.#llm;
  }

  get chatHistory(): ChatMessage<AdditionalMessageOptions>[] {
    return this.#chatHistory;
  }

  public reset(): void {
    this.#chatHistory = [];
  }

  public getTools(
    query: MessageContent,
  ): Promise<BaseToolWithCall[]> | BaseToolWithCall[] {
    return typeof this.#tools === "function" ? this.#tools(query) : this.#tools;
  }

  static shouldContinue<
    AI extends LLM,
    Store extends object = {},
    AdditionalMessageOptions extends object = AI extends LLM<
      object,
      infer AdditionalMessageOptions
    >
      ? AdditionalMessageOptions
      : never,
  >(task: Readonly<TaskStep<AI, Store, AdditionalMessageOptions>>): boolean {
    return task.context.toolCallCount < MAX_TOOL_CALLS;
  }

  // fixme: this shouldn't be async
  async createTask(message: MessageContent, stream: boolean = false) {
    const initialMessages = [...this.#chatHistory];
    if (this.#systemPrompt !== null) {
      const systemPrompt = this.#systemPrompt;
      const alreadyHasSystemPrompt = initialMessages
        .filter((msg) => msg.role === "system")
        .some((msg) => Object.is(msg.content, systemPrompt));
      if (!alreadyHasSystemPrompt) {
        initialMessages.push({
          content: systemPrompt,
          role: "system",
        });
      }
    }
    return this.#runner.createTask(extractText(message), {
      stream,
      toolCallCount: 0,
      llm: this.#llm,
      getTools: (message) => this.getTools(message),
      store: {
        ...this.createStore(),
        messages: initialMessages,
        toolOutputs: [] as ToolOutput[],
      },
      shouldContinue: AgentRunner.shouldContinue,
    });
  }

  async chat(
    params: ChatEngineParamsNonStreaming,
  ): Promise<AgentChatResponse<AdditionalMessageOptions>>;
  async chat(
    params: ChatEngineParamsStreaming,
  ): Promise<ReadableStream<AgentStreamChatResponse<AdditionalMessageOptions>>>;
  @wrapEventCaller
  async chat(
    params: ChatEngineParamsNonStreaming | ChatEngineParamsStreaming,
  ): Promise<
    | AgentChatResponse<AdditionalMessageOptions>
    | ReadableStream<AgentStreamChatResponse<AdditionalMessageOptions>>
  > {
    const task = await this.createTask(params.message, !!params.stream);
    const stepOutput = await pipeline(
      task,
      async (
        iter: AsyncIterable<
          TaskStepOutput<AI, Store, AdditionalMessageOptions>
        >,
      ) => {
        for await (const stepOutput of iter) {
          if (stepOutput.isLast) {
            return stepOutput;
          }
        }
        throw new Error("Task did not complete");
      },
    );
    const { output, taskStep } = stepOutput;
    this.#chatHistory = [...taskStep.context.store.messages];
    if (isAsyncIterable(output)) {
      let prevSources: ToolOutput[] = [...taskStep.context.store.toolOutputs];
      return output.pipeThrough<
        AgentStreamChatResponse<AdditionalMessageOptions>
      >(
        new TransformStream({
          transform(chunk, controller) {
            controller.enqueue({
              response: chunk,
              // lazy evaluation
              get sources() {
                const diffSources = taskStep.context.store.toolOutputs.filter(
                  (source) =>
                    !prevSources.some((prev) => Object.is(prev, source)),
                );
                return diffSources.length > 0 ? [...diffSources] : undefined;
              },
            });
            prevSources = [...taskStep.context.store.toolOutputs];
          },
        }),
      );
    } else {
      return {
        response: output,
        sources: [...taskStep.context.store.toolOutputs],
      } satisfies AgentChatResponse<AdditionalMessageOptions>;
    }
  }
}
