import { Settings } from "../Settings.js";
import {
  type ChatEngineParamsNonStreaming,
  type ChatEngineParamsStreaming,
} from "../engines/chat/index.js";
import { stringifyJSONToMessageContent } from "../internal/utils.js";
import { Anthropic } from "../llm/anthropic.js";
import type { ToolCallLLMMessageOptions } from "../llm/index.js";
import { ObjectRetriever } from "../objects/index.js";
import type { BaseToolWithCall } from "../types.js";
import {
  AgentRunner,
  AgentWorker,
  type AgentChatResponse,
  type AgentParamsBase,
} from "./base.js";
import type { TaskHandler } from "./types.js";
import { callTool } from "./utils.js";

type AnthropicParamsBase = AgentParamsBase<Anthropic>;

type AnthropicParamsWithTools = AnthropicParamsBase & {
  tools: BaseToolWithCall[];
};

type AnthropicParamsWithToolRetriever = AnthropicParamsBase & {
  toolRetriever: ObjectRetriever<BaseToolWithCall>;
};

export type AnthropicAgentParams =
  | AnthropicParamsWithTools
  | AnthropicParamsWithToolRetriever;

export class AnthropicAgentWorker extends AgentWorker<Anthropic> {
  taskHandler = AnthropicAgent.taskHandler;
}

export class AnthropicAgent extends AgentRunner<Anthropic> {
  constructor(params: AnthropicAgentParams) {
    super({
      llm:
        params.llm ??
        (Settings.llm instanceof Anthropic
          ? (Settings.llm as Anthropic)
          : new Anthropic()),
      chatHistory: params.chatHistory ?? [],
      systemPrompt: params.systemPrompt ?? null,
      runner: new AnthropicAgentWorker(),
      tools:
        "tools" in params
          ? params.tools
          : params.toolRetriever.retrieve.bind(params.toolRetriever),
      verbose: params.verbose ?? false,
    });
  }

  createStore = AgentRunner.defaultCreateStore;

  async chat(
    params: ChatEngineParamsNonStreaming,
  ): Promise<AgentChatResponse<ToolCallLLMMessageOptions>>;
  async chat(params: ChatEngineParamsStreaming): Promise<never>;
  override async chat(
    params: ChatEngineParamsNonStreaming | ChatEngineParamsStreaming,
  ) {
    if (params.stream) {
      throw new Error("Anthropic does not support streaming");
    }
    return super.chat(params);
  }

  static taskHandler: TaskHandler<Anthropic> = async (step, enqueueOutput) => {
    const { llm, getTools, stream } = step.context;
    const lastMessage = step.context.store.messages.at(-1)!.content;
    const tools = await getTools(lastMessage);
    if (stream === true) {
      throw new Error("Anthropic does not support streaming");
    }
    const response = await llm.chat({
      stream,
      tools,
      messages: step.context.store.messages,
    });
    step.context.store.messages = [
      ...step.context.store.messages,
      response.message,
    ];
    const options = response.message.options ?? {};
    enqueueOutput({
      taskStep: step,
      output: response,
      isLast: !("toolCall" in options),
    });
    if ("toolCall" in options) {
      const { toolCall } = options;
      const targetTool = tools.find(
        (tool) => tool.metadata.name === toolCall.name,
      );
      const toolOutput = await callTool(
        targetTool,
        toolCall,
        step.context.logger,
      );
      step.context.store.toolOutputs.push(toolOutput);
      step.context.store.messages = [
        ...step.context.store.messages,
        {
          content: stringifyJSONToMessageContent(toolOutput.output),
          role: "user",
          options: {
            toolResult: {
              result: toolOutput.output,
              isError: toolOutput.isError,
              id: toolCall.id,
            },
          },
        },
      ];
    }
  };
}
