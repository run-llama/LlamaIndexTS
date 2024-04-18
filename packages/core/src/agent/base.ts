import { pipeline, randomUUID } from "@llamaindex/env";
import {
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
} from "../llm/index.js";
import { extractText } from "../llm/utils.js";
import type { BaseTool, BaseToolWithCall, UUID } from "../types.js";
import { consumeAsyncIterable } from "./utils.js";

export const MAX_TOOL_CALLS = 10;

export type ToolOutput = {
  tool: BaseTool | undefined;
  input: unknown;
  output: string;
  isError: boolean;
};

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
  readonly tools: BaseToolWithCall[];
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

type AgentStreamChatResponse<Options extends object> = {
  response: ReadableStream<ChatResponseChunk<Options>>;
  sources: ToolOutput[];
};

type AgentChatResponse<Options extends object> = {
  response: ChatResponse<Options>;
  sources: ToolOutput[];
};

export abstract class AgentRunner<
  AI extends LLM,
  Store extends object = {},
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
  readonly #runner: AgentWorker<AI, Store, AdditionalMessageOptions>;

  // create extra store
  abstract createStore(): Store;

  static defaultCreateStore(): object {
    return Object.create(null);
  }

  protected constructor(
    llm: AI,
    chatHistory: ChatMessage<AdditionalMessageOptions>[],
    runner: AgentWorker<AI, Store, AdditionalMessageOptions>,
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

  get chatHistory(): ChatMessage<AdditionalMessageOptions>[] {
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

  static shouldContinue(task: Readonly<TaskStep<LLM, object>>): boolean {
    return task.context.toolCallCount < MAX_TOOL_CALLS;
  }

  async chat(
    params: ChatEngineParamsNonStreaming,
  ): Promise<AgentChatResponse<AdditionalMessageOptions>>;
  async chat(
    params: ChatEngineParamsStreaming,
  ): Promise<AgentStreamChatResponse<AdditionalMessageOptions>>;
  @wrapEventCaller
  async chat(
    params: ChatEngineParamsNonStreaming | ChatEngineParamsStreaming,
  ): Promise<
    | AgentChatResponse<AdditionalMessageOptions>
    | AgentStreamChatResponse<AdditionalMessageOptions>
  > {
    const task = this.#runner.createTask(extractText(params.message), {
      stream: !!params.stream,
      toolCallCount: 0,
      llm: this.#llm,
      tools: await this.getTools(extractText(params.message)),
      store: {
        ...this.createStore(),
        messages: [...this.#chatHistory],
        toolOutputs: [] as ToolOutput[],
      },
      shouldContinue: AgentRunner.shouldContinue,
    });
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
      return {
        response: output,
        sources: [...taskStep.context.store.toolOutputs],
      } satisfies AgentStreamChatResponse<AdditionalMessageOptions>;
    } else {
      return {
        response: output,
        sources: [...taskStep.context.store.toolOutputs],
      } satisfies AgentChatResponse<AdditionalMessageOptions>;
    }
  }
}

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
