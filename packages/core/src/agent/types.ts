import { ReadableStream } from "@llamaindex/env";
import type { BaseEvent } from "../internal/type.js";
import type {
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  LLM,
  MessageContent,
} from "../llm/types.js";
import type { BaseToolWithCall, ToolOutput, UUID } from "../types.js";

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
  Model extends LLM = LLM,
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

export type AgentStartEvent = BaseEvent<{
  startStep: TaskStep;
}>;
export type AgentEndEvent = BaseEvent<{
  endStep: TaskStep;
}>;
