import { pipeline, randomUUID } from "@llamaindex/env";
import { Settings } from "../Settings.js";
import {
  AgentChatResponse,
  type ChatEngineParamsNonStreaming,
} from "../engines/chat/index.js";
import { wrapEventCaller } from "../internal/context/EventCaller.js";
import { getCallbackManager } from "../internal/settings/CallbackManager.js";
import { prettifyError } from "../internal/utils.js";
import { Anthropic } from "../llm/anthropic.js";
import type {
  ChatMessage,
  ChatResponse,
  ToolCallLLMMessageOptions,
} from "../llm/index.js";
import type { LLM } from "../llm/types.js";
import { extractText } from "../llm/utils.js";
import { ObjectRetriever } from "../objects/index.js";
import type { BaseToolWithCall, UUID } from "../types.js";

const MAX_TOOL_CALLS = 10;

type AnthropicParamsBase = {
  llm?: Anthropic;
  chatHistory?: ChatMessage<ToolCallLLMMessageOptions>[];
};

type AnthropicParamsWithTools = AnthropicParamsBase & {
  tools: BaseToolWithCall[];
};

type AnthropicParamsWithToolRetriever = AnthropicParamsBase & {
  toolRetriever: ObjectRetriever<BaseToolWithCall>;
};

export type AnthropicAgentParams =
  | AnthropicParamsWithTools
  | AnthropicParamsWithToolRetriever;

//#region
type AgentTaskContext<
  Model extends LLM,
  AdditionalMessageOptions extends object = Model extends LLM<
    object,
    infer AdditionalMessageOptions
  >
    ? AdditionalMessageOptions
    : never,
> = {
  currentToolCalls: number;
  llm: Model;
  tools: BaseToolWithCall[];
  messages: ChatMessage<AdditionalMessageOptions>[];
  shouldContinue: (
    taskStep: TaskStep<Model, AdditionalMessageOptions>,
  ) => boolean;
};

type TaskStep<
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

type TaskStepOutput<
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

type TaskHandler<
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

async function* createTaskImpl<
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
    const taskOutput = await handler(step);
    yield taskOutput;
    const { isLast, output, taskStep } = taskOutput;
    input = output.message;
    context = { ...taskStep.context };
    if (isLast) {
      isDone = true;
    }
    prevStep = taskStep;
  }
}

//#endregion
abstract class AgentRunner<
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
    return task.context.currentToolCalls < MAX_TOOL_CALLS;
  }

  @wrapEventCaller
  async chat(
    params: ChatEngineParamsNonStreaming,
  ): Promise<Promise<AgentChatResponse>> {
    const task = await this.#runner.createTask(extractText(params.message), {
      currentToolCalls: 0,
      llm: this.#llm,
      tools: await this.getTools(extractText(params.message)),
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

abstract class AgentWorker<
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
    context: AgentTaskContext<AI, AdditionalMessageOptions>,
  ): Promise<AsyncGenerator<TaskStepOutput<AI, AdditionalMessageOptions>>>;
}

export class AnthropicAgentWorker implements AgentWorker<Anthropic> {
  #taskSet: Set<TaskStep<Anthropic>> = new Set();

  public constructor() {}

  get tasks(): TaskStep<Anthropic>[] {
    return [...this.#taskSet];
  }

  public async createTask(query: string, context: AgentTaskContext<Anthropic>) {
    const task = createTaskImpl(AnthropicAgent.taskHandler, context, {
      role: "user",
      content: query,
    });
    const next: AsyncGenerator<TaskStepOutput<Anthropic>>["next"] =
      task.next.bind(task);
    task.next = async (...args) => {
      const nextValue = await next(...args);
      this.#taskSet.add(nextValue.value.taskStep);
      if (nextValue.done) {
        this.#taskSet.delete(nextValue.value.taskStep);
      }
      return nextValue;
    };
    return task;
  }
}

export class AnthropicAgent extends AgentRunner<Anthropic> {
  constructor(params: AnthropicAgentParams) {
    super(
      params.llm ?? Settings.llm instanceof Anthropic
        ? (Settings.llm as Anthropic)
        : new Anthropic(),
      params.chatHistory ?? [],
      new AnthropicAgentWorker(),
      "tools" in params
        ? params.tools
        : params.toolRetriever.retrieve.bind(params.toolRetriever),
    );
  }

  static taskHandler: TaskHandler<Anthropic> = async (step) => {
    const { input } = step;
    const { llm, tools, shouldContinue } = step.context;
    step.context.messages = [...step.context.messages, input];
    const response = await llm.chat({
      stream: false,
      tools,
      messages: step.context.messages,
    });
    step.context.messages = [...step.context.messages, response.message];
    const options = response.message.options ?? {};
    if ("toolCall" in options) {
      const { toolCall } = options;
      const targetTool = tools.find(
        (tool) => tool.metadata.name === toolCall.name,
      );
      let output: string;
      let isError = true;
      if (!shouldContinue(step)) {
        output = "Error: Tool call limit reached";
      } else if (!targetTool) {
        output = `Error: Tool ${toolCall.name} not found`;
      } else {
        try {
          getCallbackManager().dispatchEvent("llm-tool-call", {
            payload: {
              toolCall: {
                name: toolCall.name,
                input: toolCall.input,
              },
            },
          });
          output = await targetTool.call(toolCall.input);
          isError = false;
        } catch (error: unknown) {
          output = prettifyError(error);
        }
      }
      return {
        taskStep: step,
        output: {
          raw: response.raw,
          message: {
            content: output,
            role: "user",
            options: {
              toolResult: {
                isError,
                id: toolCall.id,
              },
            },
          },
        },
        isLast: false,
      };
    } else {
      return {
        taskStep: step,
        output: response,
        isLast: true,
      };
    }
  };
}
