import { ReadableStream, TransformStream, randomUUID } from "@llamaindex/env";
import { Settings } from "../Settings.js";
import {
  type ChatEngine,
  type ChatEngineParamsNonStreaming,
  type ChatEngineParamsStreaming,
} from "../engines/chat/index.js";
import { wrapEventCaller } from "../internal/context/EventCaller.js";
import { consoleLogger, emptyLogger } from "../internal/logger.js";
import { getCallbackManager } from "../internal/settings/CallbackManager.js";
import { isAsyncIterable } from "../internal/utils.js";
import type {
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  LLM,
  MessageContent,
} from "../llm/index.js";
import type { BaseToolWithCall, ToolOutput } from "../types.js";
import type {
  AgentTaskContext,
  TaskHandler,
  TaskStep,
  TaskStepOutput,
} from "./types.js";

export const MAX_TOOL_CALLS = 10;

export function createTaskOutputStream<
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
): ReadableStream<TaskStepOutput<Model, Store, AdditionalMessageOptions>> {
  const steps: TaskStep<Model, Store, AdditionalMessageOptions>[] = [];
  return new ReadableStream<
    TaskStepOutput<Model, Store, AdditionalMessageOptions>
  >({
    pull: async (controller) => {
      const step: TaskStep<Model, Store, AdditionalMessageOptions> = {
        id: randomUUID(),
        context,
        prevStep: null,
        nextSteps: new Set(),
      };
      if (steps.length > 0) {
        step.prevStep = steps[steps.length - 1];
      }
      const taskOutputs: TaskStepOutput<
        Model,
        Store,
        AdditionalMessageOptions
      >[] = [];
      steps.push(step);
      const enqueueOutput = (
        output: TaskStepOutput<Model, Store, AdditionalMessageOptions>,
      ) => {
        context.logger.log("Enqueueing output for step(id, %s).", step.id);
        taskOutputs.push(output);
        controller.enqueue(output);
      };
      getCallbackManager().dispatchEvent("agent-start", {
        payload: {
          startStep: step,
        },
      });

      context.logger.log("Starting step(id, %s).", step.id);
      await handler(step, enqueueOutput);
      context.logger.log("Finished step(id, %s).", step.id);
      // fixme: support multi-thread when there are multiple outputs
      // todo: for now we pretend there is only one task output
      const { isLast, taskStep } = taskOutputs[0];
      context = {
        ...taskStep.context,
        store: {
          ...taskStep.context.store,
        },
        toolCallCount: 1,
      };
      if (isLast) {
        context.logger.log(
          "Final step(id, %s) reached, closing task.",
          step.id,
        );
        getCallbackManager().dispatchEvent("agent-end", {
          payload: {
            endStep: step,
          },
        });
        controller.close();
      }
    },
  });
}

export type AgentStreamChatResponse<Options extends object> = {
  response: ChatResponseChunk<Options>;
  sources: ToolOutput[];
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
  verbose: boolean;
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
  verbose?: boolean;
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
    query: MessageContent,
    context: AgentTaskContext<AI, Store, AdditionalMessageOptions>,
  ): ReadableStream<TaskStepOutput<AI, Store, AdditionalMessageOptions>> {
    context.store.messages.push({
      role: "user",
      content: query,
    });
    const taskOutputStream = createTaskOutputStream(this.taskHandler, context);
    return new ReadableStream<
      TaskStepOutput<AI, Store, AdditionalMessageOptions>
    >({
      start: async (controller) => {
        for await (const stepOutput of taskOutputStream) {
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
  readonly #verbose: boolean;

  // create extra store
  abstract createStore(): Store;

  static defaultCreateStore(): object {
    return Object.create(null);
  }

  protected constructor(
    params: AgentRunnerParams<AI, Store, AdditionalMessageOptions>,
  ) {
    const { llm, chatHistory, systemPrompt, runner, tools, verbose } = params;
    this.#llm = llm;
    this.#chatHistory = chatHistory;
    this.#runner = runner;
    if (systemPrompt) {
      this.#systemPrompt = systemPrompt;
    }
    this.#tools = tools;
    this.#verbose = verbose;
  }

  get llm() {
    return this.#llm;
  }

  get chatHistory(): ChatMessage<AdditionalMessageOptions>[] {
    return this.#chatHistory;
  }

  get verbose(): boolean {
    return Settings.debug || this.#verbose;
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

  createTask(
    message: MessageContent,
    stream: boolean = false,
    verbose: boolean | undefined = undefined,
  ) {
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
    return this.#runner.createTask(message, {
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
      logger:
        // disable verbose if explicitly set to false
        verbose === false
          ? emptyLogger
          : verbose || this.verbose
            ? consoleLogger
            : emptyLogger,
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
    const task = this.createTask(params.message, !!params.stream);
    for await (const stepOutput of task) {
      // update chat history for each round
      this.#chatHistory = [...stepOutput.taskStep.context.store.messages];
      if (stepOutput.isLast) {
        const { output, taskStep } = stepOutput;
        if (isAsyncIterable(output)) {
          return output.pipeThrough<
            AgentStreamChatResponse<AdditionalMessageOptions>
          >(
            new TransformStream({
              transform(chunk, controller) {
                controller.enqueue({
                  response: chunk,
                  get sources() {
                    return [...taskStep.context.store.toolOutputs];
                  },
                });
              },
            }),
          );
        } else {
          return {
            response: output,
            get sources() {
              return [...taskStep.context.store.toolOutputs];
            },
          } satisfies AgentChatResponse<AdditionalMessageOptions>;
        }
      }
    }
    throw new Error("Task ended without a last step.");
  }
}
