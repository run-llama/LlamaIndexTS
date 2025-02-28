import { consoleLogger, emptyLogger, randomUUID } from "@llamaindex/env";
import {
  BaseChatEngine,
  type NonStreamingChatEngineParams,
  type StreamingChatEngineParams,
} from "../chat-engine";
import { wrapEventCaller } from "../decorator";
import { Settings } from "../global";
import type {
  BaseToolWithCall,
  ChatMessage,
  LLM,
  MessageContent,
  ToolOutput,
} from "../llms";
import { BaseMemory } from "../memory";
import type { ObjectRetriever } from "../objects";
import { EngineResponse } from "../schema";
import type {
  AgentTaskContext,
  TaskHandler,
  TaskStep,
  TaskStepOutput,
} from "./types.js";
import { stepTools, stepToolsStreaming } from "./utils.js";

export const MAX_TOOL_CALLS = 10;

export function createTaskOutputStream<
  Model extends LLM,
  Store extends object = object,
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
        step.prevStep = steps[steps.length - 1]!;
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
      Settings.callbackManager.dispatchEvent("agent-start", {
        startStep: step,
      });

      context.logger.log("Starting step(id, %s).", step.id);
      await handler(step, enqueueOutput);
      context.logger.log("Finished step(id, %s).", step.id);
      // fixme: support multi-thread when there are multiple outputs
      // todo: for now we pretend there is only one task output
      const { isLast, taskStep } = taskOutputs[0]!;
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
        Settings.callbackManager.dispatchEvent("agent-end", {
          endStep: step,
        });
        controller.close();
      }
    },
  });
}

export type AgentRunnerParams<
  AI extends LLM,
  Store extends object = object,
  AdditionalMessageOptions extends object = AI extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
  AdditionalChatOptions extends object = object,
> = {
  llm: AI;
  chatHistory: ChatMessage<AdditionalMessageOptions>[];
  systemPrompt: MessageContent | null;
  runner: AgentWorker<
    AI,
    Store,
    AdditionalMessageOptions,
    AdditionalChatOptions
  >;
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
  AdditionalChatOptions extends object = object,
> =
  | {
      llm?: AI;
      chatHistory?: ChatMessage<AdditionalMessageOptions>[];
      systemPrompt?: MessageContent;
      verbose?: boolean;
      tools: BaseToolWithCall[];
      additionalChatOptions?: AdditionalChatOptions;
    }
  | {
      llm?: AI;
      chatHistory?: ChatMessage<AdditionalMessageOptions>[];
      systemPrompt?: MessageContent;
      verbose?: boolean;
      toolRetriever: ObjectRetriever<BaseToolWithCall>;
      additionalChatOptions?: AdditionalChatOptions;
    };

/**
 * Worker will schedule tasks and handle the task execution
 */
export abstract class AgentWorker<
  AI extends LLM,
  Store extends object = object,
  AdditionalMessageOptions extends object = AI extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
  AdditionalChatOptions extends object = object,
> {
  #taskSet = new Set<
    TaskStep<AI, Store, AdditionalMessageOptions, AdditionalChatOptions>
  >();
  abstract taskHandler: TaskHandler<
    AI,
    Store,
    AdditionalMessageOptions,
    AdditionalChatOptions
  >;

  public createTask(
    query: MessageContent,
    context: AgentTaskContext<
      AI,
      Store,
      AdditionalMessageOptions,
      AdditionalChatOptions
    >,
  ): ReadableStream<
    TaskStepOutput<AI, Store, AdditionalMessageOptions, AdditionalChatOptions>
  > {
    context.store.messages.push({
      role: "user",
      content: query,
    });
    const taskOutputStream = createTaskOutputStream(this.taskHandler, context);
    return new ReadableStream<
      TaskStepOutput<AI, Store, AdditionalMessageOptions, AdditionalChatOptions>
    >({
      start: async (controller) => {
        for await (const stepOutput of taskOutputStream) {
          this.#taskSet.add(stepOutput.taskStep);
          if (stepOutput.isLast) {
            let currentStep: TaskStep<
              AI,
              Store,
              AdditionalMessageOptions,
              AdditionalChatOptions
            > | null = stepOutput.taskStep;
            while (currentStep) {
              this.#taskSet.delete(currentStep);
              currentStep = currentStep.prevStep;
            }
            const { output, taskStep } = stepOutput;
            if (output instanceof ReadableStream) {
              const [pipStream, finalStream] = output.tee();
              stepOutput.output = finalStream;
              const reader = pipStream.getReader();
              const { value } = await reader.read();
              reader.releaseLock();
              let content: string = value!.delta;
              (async () => {
                for await (const chunk of pipStream) {
                  content += chunk.delta;
                }
                taskStep.context.store.messages = [
                  ...taskStep.context.store.messages,
                  {
                    role: "assistant",
                    content,
                    options: value!.options,
                  },
                ];
              })();
            }
            controller.enqueue(stepOutput);
            controller.close();
          } else {
            controller.enqueue(stepOutput);
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
  Store extends object = object,
  AdditionalMessageOptions extends object = AI extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
  AdditionalChatOptions extends object = object,
> extends BaseChatEngine {
  readonly #llm: AI;
  readonly #tools:
    | BaseToolWithCall[]
    | ((query: MessageContent) => Promise<BaseToolWithCall[]>);
  readonly #systemPrompt: MessageContent | null = null;
  #chatHistory: ChatMessage<AdditionalMessageOptions>[];
  readonly #runner: AgentWorker<
    AI,
    Store,
    AdditionalMessageOptions,
    AdditionalChatOptions
  >;
  readonly #verbose: boolean;

  // create extra store
  abstract createStore(): Store;

  static defaultCreateStore(): object {
    return Object.create(null);
  }

  static defaultTaskHandler: TaskHandler<LLM> = async (step, enqueueOutput) => {
    const { llm, getTools, stream, additionalChatOptions } = step.context;
    const lastMessage = step.context.store.messages.at(-1)!.content;
    const tools = await getTools(lastMessage);
    if (!stream) {
      const response = await llm.chat({
        stream,
        tools,
        messages: [...step.context.store.messages],
        additionalChatOptions,
      });
      await stepTools({
        response,
        tools,
        step,
        enqueueOutput,
      });
    } else {
      const response = await llm.chat({
        stream,
        tools,
        messages: [...step.context.store.messages],
        additionalChatOptions,
      });
      await stepToolsStreaming<LLM>({
        response,
        tools,
        step,
        enqueueOutput,
      });
    }
  };

  protected constructor(
    params: AgentRunnerParams<
      AI,
      Store,
      AdditionalMessageOptions,
      AdditionalChatOptions
    >,
  ) {
    super();
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
    Store extends object = object,
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
    chatHistory?: ChatMessage<AdditionalMessageOptions>[],
    additionalChatOptions?: AdditionalChatOptions,
  ): ReadableStream<
    TaskStepOutput<AI, Store, AdditionalMessageOptions, AdditionalChatOptions>
  > {
    const initialMessages = [...(chatHistory ?? this.#chatHistory)];
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
      additionalChatOptions: additionalChatOptions ?? {},
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
    params: NonStreamingChatEngineParams<
      AdditionalMessageOptions,
      AdditionalChatOptions
    >,
  ): Promise<EngineResponse>;
  async chat(
    params: StreamingChatEngineParams<
      AdditionalMessageOptions,
      AdditionalChatOptions
    >,
  ): Promise<ReadableStream<EngineResponse>>;
  @wrapEventCaller
  async chat(
    params:
      | NonStreamingChatEngineParams<
          AdditionalMessageOptions,
          AdditionalChatOptions
        >
      | StreamingChatEngineParams<
          AdditionalMessageOptions,
          AdditionalChatOptions
        >,
  ): Promise<EngineResponse | ReadableStream<EngineResponse>> {
    let chatHistory: ChatMessage<AdditionalMessageOptions>[] = [];

    if (params.chatHistory instanceof BaseMemory) {
      chatHistory =
        (await params.chatHistory.getMessages()) as ChatMessage<AdditionalMessageOptions>[];
    } else {
      chatHistory =
        params.chatHistory as ChatMessage<AdditionalMessageOptions>[];
    }

    const task = this.createTask(
      params.message,
      !!params.stream,
      false,
      chatHistory,
      params.chatOptions,
    );
    for await (const stepOutput of task) {
      // update chat history for each round
      this.#chatHistory = [...stepOutput.taskStep.context.store.messages];
      if (stepOutput.isLast) {
        const { output } = stepOutput;
        if (output instanceof ReadableStream) {
          return output.pipeThrough(
            new TransformStream({
              transform(chunk, controller) {
                controller.enqueue(EngineResponse.fromChatResponseChunk(chunk));
              },
            }),
          );
        } else {
          return EngineResponse.fromChatResponse(output);
        }
      }
    }
    throw new Error("Task ended without a last step.");
  }
}
