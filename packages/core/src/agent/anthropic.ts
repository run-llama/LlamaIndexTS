import { AsyncLocalStorage } from "@llamaindex/env";
import { Settings } from "../Settings.js";
import {
  AgentChatResponse,
  type ChatEngineParamsNonStreaming,
} from "../engines/chat/index.js";
import { wrapEventCaller } from "../internal/context/EventCaller.js";
import {
  Anthropic,
  type AnthropicAdditionalMessageOptions,
} from "../llm/anthropic.js";
import type { ChatMessage, ChatResponse } from "../llm/index.js";
import { extractText } from "../llm/utils.js";
import type { BaseToolWithCall } from "../types.js";

const agentContextAsyncLocalStorage = new AsyncLocalStorage<AgentContext>();
const MAX_TOOL_CALLS = 3;

export type AnthropicParams = {
  llm?: Anthropic;
  tools: BaseToolWithCall[];
};

type AgentContext = {
  toolCalls: number;
  llm: Anthropic;
  tools: BaseToolWithCall[];
  messages: ChatMessage<AnthropicAdditionalMessageOptions>[];
};

async function chatTaskStateMachine(
  message: ChatMessage<AnthropicAdditionalMessageOptions>,
): Promise<ChatResponse<AnthropicAdditionalMessageOptions>> {
  const context = agentContextAsyncLocalStorage.getStore();
  if (!context) {
    throw new Error("No context found, please initialize the agent first.");
  }
  const { llm, messages, toolCalls } = context;
  if (toolCalls >= MAX_TOOL_CALLS) {
    // todo: add a message to the user that the tool calls limit has been reached
  }
  const nextMessages: ChatMessage<AnthropicAdditionalMessageOptions>[] = [
    ...messages,
    message,
  ];
  const response = await llm.chat({
    stream: false,
    tools: context.tools,
    messages: nextMessages,
  });
  if ("toolUse" in response.message.options) {
    const { toolUse } = response.message.options;
    const { input, name, id } = toolUse;
    const targetTool = context.tools.find(
      (tool) => tool.metadata.name === name,
    );
    let output: string;
    let isError = true;
    if (!targetTool) {
      output = `Error: Tool ${name} not found`;
    } else {
      try {
        output = await targetTool.call(input);
        isError = false;
      } catch (error: unknown) {
        output = `Error: ${error}`;
      }
    }
    return agentContextAsyncLocalStorage.run(
      {
        ...context,
        toolCalls: context.toolCalls + 1,
        messages: [...nextMessages, response.message],
      },
      async () => {
        return chatTaskStateMachine({
          content: output,
          role: "assistant",
          options: {
            toolResult: {
              isError,
              tool_use_id: id,
            },
          },
        });
      },
    );
  } else {
    return response;
  }
}

export class AnthropicAgent {
  readonly #llm: Anthropic;
  readonly #tools: BaseToolWithCall[] = [];

  constructor(params: AnthropicParams) {
    this.#llm =
      params.llm ?? Settings.llm instanceof Anthropic
        ? (Settings.llm as Anthropic)
        : new Anthropic();
    this.#tools = params.tools;
  }

  @wrapEventCaller
  async chat(
    params: ChatEngineParamsNonStreaming,
  ): Promise<Promise<AgentChatResponse>> {
    const response = await agentContextAsyncLocalStorage.run(
      {
        toolCalls: 0,
        llm: this.#llm,
        tools: this.#tools,
        messages: [],
      },
      async () =>
        chatTaskStateMachine({
          role: "user",
          content: params.message,
          options: {},
        }),
    );
    return new AgentChatResponse(extractText(response.message.content));
  }
}
