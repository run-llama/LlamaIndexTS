import { Settings } from "../Settings.js";
import {
  AgentChatResponse,
  type ChatEngineParamsNonStreaming,
} from "../engines/chat/index.js";
import { wrapEventCaller } from "../internal/context/EventCaller.js";
import { getCallbackManager } from "../internal/settings/CallbackManager.js";
import { prettifyError } from "../internal/utils.js";
import {
  Anthropic,
  type AnthropicAdditionalMessageOptions,
} from "../llm/anthropic.js";
import type { ChatMessage, ChatResponse } from "../llm/index.js";
import { extractText } from "../llm/utils.js";
import { ObjectRetriever } from "../objects/index.js";
import type { BaseToolWithCall } from "../types.js";

const MAX_TOOL_CALLS = 10;

type AnthropicParamsBase = {
  llm?: Anthropic;
  chatHistory?: ChatMessage<AnthropicAdditionalMessageOptions>[];
};

type AnthropicParamsWithTools = AnthropicParamsBase & {
  tools: BaseToolWithCall[];
};

type AnthropicParamsWithToolRetriever = AnthropicParamsBase & {
  toolRetriever: ObjectRetriever;
};

export type AnthropicAgentParams =
  | AnthropicParamsWithTools
  | AnthropicParamsWithToolRetriever;

type AgentContext = {
  toolCalls: number;
  llm: Anthropic;
  tools: BaseToolWithCall[];
  messages: ChatMessage<AnthropicAdditionalMessageOptions>[];
  shouldContinue: (context: AgentContext) => boolean;
};

type TaskResult = {
  response: ChatResponse<AnthropicAdditionalMessageOptions>;
  chatHistory: ChatMessage<AnthropicAdditionalMessageOptions>[];
};

async function task(
  context: AgentContext,
  input: ChatMessage<AnthropicAdditionalMessageOptions>,
): Promise<TaskResult> {
  const { llm, tools, messages } = context;
  const nextMessages: ChatMessage<AnthropicAdditionalMessageOptions>[] = [
    ...messages,
    input,
  ];
  const response = await llm.chat({
    stream: false,
    tools,
    messages: nextMessages,
  });
  const options = response.message.options ?? {};
  if ("toolCall" in options) {
    const { toolCall } = options;
    const { input, name, id } = toolCall;
    const targetTool = tools.find((tool) => tool.metadata.name === name);
    let output: string;
    let isError = true;
    if (!context.shouldContinue(context)) {
      output = "Error: Tool call limit reached";
    } else if (!targetTool) {
      output = `Error: Tool ${name} not found`;
    } else {
      try {
        getCallbackManager().dispatchEvent("llm-tool-call", {
          payload: {
            toolCall: {
              name,
              input,
            },
          },
        });
        output = await targetTool.call(JSON.parse(input));
        isError = false;
      } catch (error: unknown) {
        output = prettifyError(error);
      }
    }
    return task(
      {
        ...context,
        toolCalls: context.toolCalls + 1,
        messages: [...nextMessages, response.message],
      },
      {
        content: output,
        role: "user",
        options: {
          toolResult: {
            is_error: isError,
            tool_use_id: id,
          },
        },
      },
    );
  } else {
    return { response, chatHistory: [...nextMessages, response.message] };
  }
}

export class AnthropicAgent {
  readonly #llm: Anthropic;
  readonly #tools:
    | BaseToolWithCall[]
    | ((query: string) => Promise<BaseToolWithCall[]>) = [];
  #chatHistory: ChatMessage<AnthropicAdditionalMessageOptions>[] = [];

  constructor(params: AnthropicAgentParams) {
    this.#llm =
      params.llm ?? Settings.llm instanceof Anthropic
        ? (Settings.llm as Anthropic)
        : new Anthropic();
    if ("tools" in params) {
      this.#tools = params.tools;
    } else if ("toolRetriever" in params) {
      this.#tools = params.toolRetriever.retrieve.bind(params.toolRetriever);
    }
    if (Array.isArray(params.chatHistory)) {
      this.#chatHistory = params.chatHistory;
    }
  }

  static shouldContinue(context: AgentContext): boolean {
    return context.toolCalls < MAX_TOOL_CALLS;
  }

  public reset(): void {
    this.#chatHistory = [];
  }

  getTools(query: string): Promise<BaseToolWithCall[]> | BaseToolWithCall[] {
    return typeof this.#tools === "function" ? this.#tools(query) : this.#tools;
  }

  @wrapEventCaller
  async chat(
    params: ChatEngineParamsNonStreaming,
  ): Promise<Promise<AgentChatResponse>> {
    const { chatHistory, response } = await task(
      {
        llm: this.#llm,
        tools: await this.getTools(extractText(params.message)),
        toolCalls: 0,
        messages: [...this.#chatHistory],
        // do we need this?
        shouldContinue: AnthropicAgent.shouldContinue,
      },
      {
        role: "user",
        content: params.message,
        options: {},
      },
    );
    this.#chatHistory = [...chatHistory];
    return new AgentChatResponse(extractText(response.message.content));
  }
}
