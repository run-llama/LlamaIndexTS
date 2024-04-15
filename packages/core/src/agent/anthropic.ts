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

const MAX_TOOL_CALLS = 10;

const agentContextAsyncLocalStorage = new AsyncLocalStorage<WorkerContext>();

export type AnthropicParams = {
  llm?: Anthropic;
  tools: BaseToolWithCall[];
};

type WorkerContext = {
  toolCalls: number;
  agent: AnthropicAgent;
  messages: ChatMessage<AnthropicAdditionalMessageOptions>[];
};

function shouldContinue(context: WorkerContext): boolean {
  return context.toolCalls < MAX_TOOL_CALLS;
}

async function createTaskStateMachine(
  message: ChatMessage<AnthropicAdditionalMessageOptions>,
): Promise<ChatResponse<AnthropicAdditionalMessageOptions>> {
  const context = agentContextAsyncLocalStorage.getStore();
  if (!context) {
    throw new Error("No context found, please initialize the agent first.");
  }
  const { agent, messages, toolCalls } = context;
  const nextMessages: ChatMessage<AnthropicAdditionalMessageOptions>[] = [
    ...messages,
    message,
  ];
  const response = await agent.llm.chat({
    stream: false,
    tools: agent.tools,
    messages: nextMessages,
  });
  if ("toolUse" in response.message.options) {
    const { toolUse } = response.message.options;
    const { input, name, id } = toolUse;
    const targetTool = agent.tools.find((tool) => tool.metadata.name === name);
    let output: string;
    let isError = true;
    if (!shouldContinue(context)) {
      output = "Error: Tool call limit reached";
    } else if (!targetTool) {
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
        return createTaskStateMachine({
          content: output,
          role: "user",
          options: {
            toolResult: {
              is_error: isError,
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

  static shouldContinue(context: WorkerContext): boolean {
    return context.toolCalls < MAX_TOOL_CALLS;
  }

  get tools(): BaseToolWithCall[] {
    return this.#tools;
  }

  get llm(): Anthropic {
    return this.#llm;
  }

  @wrapEventCaller
  async chat(
    params: ChatEngineParamsNonStreaming,
  ): Promise<Promise<AgentChatResponse>> {
    const response = await agentContextAsyncLocalStorage.run(
      {
        agent: this,
        toolCalls: 0,
        messages: [],
      },
      async () =>
        createTaskStateMachine({
          role: "user",
          content: params.message,
          options: {},
        }),
    );
    return new AgentChatResponse(extractText(response.message.content));
  }
}
