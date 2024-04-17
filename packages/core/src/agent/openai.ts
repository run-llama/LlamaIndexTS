import { Settings } from "../Settings.js";
import {
  AgentChatResponse,
  type ChatEngineParamsNonStreaming,
  type ChatEngineParamsStreaming,
} from "../engines/chat/index.js";
import type { ChatMessage, ToolCallLLMMessageOptions } from "../llm/index.js";
import { OpenAI } from "../llm/open_ai.js";
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

type OpenAIParamsBase = {
  llm?: OpenAI;
  chatHistory?: ChatMessage<ToolCallLLMMessageOptions>[];
};

type OpenAIParamsWithTools = OpenAIParamsBase & {
  tools: BaseToolWithCall[];
};

type OpenAIParamsWithToolRetriever = OpenAIParamsBase & {
  toolRetriever: ObjectRetriever<BaseToolWithCall>;
};

export type OpenAIAgentParams =
  | OpenAIParamsWithTools
  | OpenAIParamsWithToolRetriever;

export class OpenAIAgentWorker implements AgentWorker<OpenAI> {
  #taskSet: Set<TaskStep<OpenAI>> = new Set();

  public constructor() {}

  get tasks(): TaskStep<OpenAI>[] {
    return [...this.#taskSet];
  }

  public async createTask(query: string, context: AgentTaskContext<OpenAI>) {
    const task = createTaskImpl(OpenAIAgent.taskHandler, context, {
      role: "user",
      content: query,
    });
    const next: AsyncGenerator<TaskStepOutput<OpenAI>>["next"] =
      task.next.bind(task);
    task.next = async (...args) => {
      const nextValue = await next(...args);
      const taskStepOutput = nextValue.value as TaskStepOutput<OpenAI>;
      const { taskStep, isLast } = taskStepOutput;
      this.#taskSet.add(taskStep);
      if (isLast) {
        let currentStep: TaskStep<OpenAI> | null = taskStep;
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

export class OpenAIAgent extends AgentRunner<OpenAI> {
  constructor(params: OpenAIAgentParams) {
    super(
      params.llm ?? Settings.llm instanceof OpenAI
        ? (Settings.llm as OpenAI)
        : new OpenAI(),
      params.chatHistory ?? [],
      new OpenAIAgentWorker(),
      "tools" in params
        ? params.tools
        : params.toolRetriever.retrieve.bind(params.toolRetriever),
    );
  }

  override async chat(
    params: ChatEngineParamsNonStreaming | ChatEngineParamsStreaming,
  ): Promise<Promise<AgentChatResponse>> {
    if (params.stream) {
      throw new Error("Anthropic does not support streaming");
    }
    return super.chat(params);
  }

  static taskHandler: TaskHandler<OpenAI> = async (step) => {
    const { input } = step;
    const { llm, tools, stream } = step.context;
    step.context.messages = [...step.context.messages, input];
    if (!stream) {
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
    } else {
      throw new Error("TODO");
    }
  };
}
