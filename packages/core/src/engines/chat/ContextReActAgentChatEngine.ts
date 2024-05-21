import type { ChatHistory } from "../../ChatHistory.js";
import { getHistory } from "../../ChatHistory.js";
import type { ContextSystemPrompt } from "../../Prompt.js";
import { Response } from "../../Response.js";
import type { BaseRetriever } from "../../Retriever.js";
import { ReActAgent, type BaseToolWithCall } from "../../index.edge.js";
import { wrapEventCaller } from "../../internal/context/EventCaller.js";
import type { ChatMessage } from "../../llm/index.js";
import type { LLM } from "../../llm/types.js";
import {
  extractText,
  streamConverter,
  streamReducer,
} from "../../llm/utils.js";
import type { BaseNodePostprocessor } from "../../postprocessors/index.js";
import { PromptMixin } from "../../prompts/Mixin.js";
import { DefaultContextGenerator } from "./DefaultContextGenerator.js";
import type {
  ChatEngine,
  ChatEngineParamsNonStreaming,
  ChatEngineParamsStreaming,
  ContextGenerator,
} from "./types.js";
import { prepareRequestMessagesWithContext } from "./utils.js";

export class ContextReActAgentChatEngine
  extends PromptMixin
  implements ChatEngine
{
  chatModel: LLM;
  tools: BaseToolWithCall[] = [];
  chatHistory: ChatHistory;
  contextGenerator: ContextGenerator;
  systemPrompt?: string;

  constructor(init: {
    retriever: BaseRetriever;
    chatModel: LLM;
    tools?: BaseToolWithCall[];
    chatHistory?: ChatMessage[];
    contextSystemPrompt?: ContextSystemPrompt;
    nodePostprocessors?: BaseNodePostprocessor[];
    systemPrompt?: string;
  }) {
    super();

    this.systemPrompt = this.systemPrompt;
    this.chatModel = init.chatModel;
    this.tools = init.tools ?? [];
    this.chatHistory = getHistory(init?.chatHistory);
    this.contextGenerator = new DefaultContextGenerator({
      retriever: init.retriever,
      contextSystemPrompt: init?.contextSystemPrompt,
      nodePostprocessors: init?.nodePostprocessors,
    });
  }

  protected _getPromptModules(): Record<string, ContextGenerator> {
    return {
      contextGenerator: this.contextGenerator,
    };
  }

  chat(params: ChatEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  chat(params: ChatEngineParamsNonStreaming): Promise<Response>;
  @wrapEventCaller
  async chat(
    params: ChatEngineParamsStreaming | ChatEngineParamsNonStreaming,
  ): Promise<Response | AsyncIterable<Response>> {
    const { message, stream } = params;
    const chatHistory = params.chatHistory
      ? getHistory(params.chatHistory)
      : this.chatHistory;
    const requestMessages = await prepareRequestMessagesWithContext({
      message,
      chatHistory,
      contextGenerator: this.contextGenerator,
      systemPrompt: this.systemPrompt,
    });
    const agent = new ReActAgent({
      tools: this.tools,
      llm: this.chatModel,
      chatHistory: requestMessages.messages,
    });

    if (stream) {
      const stream = await agent.chat({
        message: params.message,
        stream: true,
      });
      return streamConverter(
        streamReducer({
          stream,
          initialValue: "",
          reducer: (accumulator, part) => (accumulator += part.response.delta),
          finished: (accumulator) => {
            chatHistory.addMessage({ content: accumulator, role: "assistant" });
          },
        }),
        (r) => new Response(r.response.delta, requestMessages.nodes),
      );
    }
    const response = await agent.chat({
      message: params.message,
      stream: false,
    });
    chatHistory.addMessage(response.response.message);
    return new Response(
      extractText(response.response.message.content),
      requestMessages.nodes,
    );
  }

  reset() {
    this.chatHistory.reset();
  }
}
