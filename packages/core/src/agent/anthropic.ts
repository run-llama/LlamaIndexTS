import { Settings } from "../Settings.js";
import {
  type ChatEngineParamsNonStreaming,
  type ChatEngineParamsStreaming,
} from "../engines/chat/index.js";
import { Anthropic } from "../llm/anthropic.js";
import type {
  ChatMessage,
  ChatResponse,
  ToolCallLLMMessageOptions,
} from "../llm/index.js";
import { ObjectRetriever } from "../objects/index.js";
import type { BaseToolWithCall } from "../types.js";
import {
  AgentRunner,
  AgentWorker,
  createTaskImpl,
  type AgentTaskContext,
  type TaskHandler,
  type TaskStep,
  type TaskStepOutput,
} from "./base.js";
import { callTool } from "./utils.js";

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
      const taskStepOutput = nextValue.value as TaskStepOutput<Anthropic>;
      const { taskStep, isLast } = taskStepOutput;
      this.#taskSet.add(taskStep);
      if (isLast) {
        let currentStep: TaskStep<Anthropic> | null = taskStep;
        while (currentStep) {
          this.#taskSet.delete(currentStep);
          currentStep = currentStep.prevStep;
        }
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

  async chat(
    params: ChatEngineParamsNonStreaming,
  ): Promise<ChatResponse<ToolCallLLMMessageOptions>>;
  async chat(params: ChatEngineParamsStreaming): Promise<never>;
  override async chat(
    params: ChatEngineParamsNonStreaming | ChatEngineParamsStreaming,
  ) {
    if (params.stream) {
      throw new Error("Anthropic does not support streaming");
    }
    return super.chat(params);
  }

  static taskHandler: TaskHandler<Anthropic> = async (step) => {
    const { input } = step;
    const { llm, tools, stream } = step.context;
    if (input) {
      step.context.messages = [...step.context.messages, input];
    }
    if (stream === true) {
      throw new Error("Anthropic does not support streaming");
    }
    const response = await llm.chat({
      stream,
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
      const toolOutput = await callTool(targetTool, toolCall);
      step.context.toolOutputs.push(toolOutput);
      return {
        taskStep: step,
        output: {
          raw: response.raw,
          message: {
            content: toolOutput.output,
            role: "user",
            options: {
              toolResult: {
                result: toolOutput.output,
                isError: toolOutput.isError,
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
