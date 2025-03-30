import type { Logger } from "@llamaindex/env";
import type { UUID } from "../global";
import type {
  BaseToolWithCall,
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  LLM,
  MessageContent,
  ToolOutput,
} from "../llms";

export type AgentTaskContext<
  Model extends LLM,
  Store extends object = object,
  AdditionalMessageOptions extends object = Model extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
  AdditionalChatOptions extends object = object,
> = {
  readonly stream: boolean;
  readonly toolCallCount: number;
  readonly llm: Model;
  readonly getTools: (
    input: MessageContent,
  ) => BaseToolWithCall[] | Promise<BaseToolWithCall[]>;
  readonly additionalChatOptions: Partial<AdditionalChatOptions>;
  shouldContinue: (
    taskStep: Readonly<TaskStep<Model, Store, AdditionalMessageOptions>>,
  ) => boolean;
  store: {
    toolOutputs: ToolOutput[];
    messages: ChatMessage<AdditionalMessageOptions>[];
  } & Store;
  logger: Readonly<Logger>;
};

export type TaskStep<
  Model extends LLM = LLM,
  Store extends object = object,
  AdditionalMessageOptions extends object = Model extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
  AdditionalChatOptions extends object = object,
> = {
  id: UUID;
  context: AgentTaskContext<
    Model,
    Store,
    AdditionalMessageOptions,
    AdditionalChatOptions
  >;

  // linked list
  prevStep: TaskStep<
    Model,
    Store,
    AdditionalMessageOptions,
    AdditionalChatOptions
  > | null;
  nextSteps: Set<
    TaskStep<Model, Store, AdditionalMessageOptions, AdditionalChatOptions>
  >;
};

export type TaskStepOutput<
  Model extends LLM,
  Store extends object = object,
  AdditionalMessageOptions extends object = Model extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
  AdditionalChatOptions extends object = object,
> = {
  taskStep: TaskStep<
    Model,
    Store,
    AdditionalMessageOptions,
    AdditionalChatOptions
  >;
  // output shows the response to the user
  output:
    | ChatResponse<AdditionalMessageOptions>
    | ReadableStream<ChatResponseChunk<AdditionalMessageOptions>>;
  isLast: boolean;
};

export type TaskHandler<
  Model extends LLM,
  Store extends object = object,
  AdditionalMessageOptions extends object = Model extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
  AdditionalChatOptions extends object = object,
> = (
  step: TaskStep<Model, Store, AdditionalMessageOptions, AdditionalChatOptions>,
  enqueueOutput: (
    taskOutput: TaskStepOutput<
      Model,
      Store,
      AdditionalMessageOptions,
      AdditionalChatOptions
    >,
  ) => void,
) => Promise<void>;

export type AgentStartEvent = {
  startStep: TaskStep;
};
export type AgentEndEvent = {
  endStep: TaskStep;
};
