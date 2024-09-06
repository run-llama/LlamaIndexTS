import type {
  ChatMessage,
  LLM,
  MessageContent,
  MessageType,
} from "@llamaindex/core/llms";
import { EngineResponse, MetadataMode } from "@llamaindex/core/schema";
import {
  extractText,
  streamConverter,
  streamReducer,
  wrapEventCaller,
} from "@llamaindex/core/utils";
import type { ChatHistory } from "../../ChatHistory.js";
import { getHistory } from "../../ChatHistory.js";
import type { BaseRetriever } from "../../Retriever.js";
import { Settings } from "../../Settings.js";
import type { BaseNodePostprocessor } from "../../postprocessors/index.js";
import { DefaultContextGenerator } from "./DefaultContextGenerator.js";
import type {
  ChatEngine,
  ChatEngineParamsNonStreaming,
  ChatEngineParamsStreaming,
  ContextGenerator,
} from "./types.js";
import {
  type ContextSystemPrompt,
  type ModuleRecord,
  PromptMixin,
  type PromptsRecord
} from '@llamaindex/core/prompts';

/**
 * ContextChatEngine uses the Index to get the appropriate context for each query.
 * The context is stored in the system prompt, and the chat history is chunk: ChatResponseChunk, nodes?: NodeWithScore<import("/Users/marcus/code/llamaindex/LlamaIndexTS/packages/core/src/Node").Metadata>[], nodes?: NodeWithScore<import("/Users/marcus/code/llamaindex/LlamaIndexTS/packages/core/src/Node").Metadata>[]lowing the appropriate context to be surfaced for each query.
 */
export class ContextChatEngine extends PromptMixin implements ChatEngine {
  chatModel: LLM;
  chatHistory: ChatHistory;
  contextGenerator: ContextGenerator & PromptMixin;
  systemPrompt?: string;

  constructor(init: {
    retriever: BaseRetriever;
    chatModel?: LLM;
    chatHistory?: ChatMessage[];
    contextSystemPrompt?: ContextSystemPrompt;
    nodePostprocessors?: BaseNodePostprocessor[];
    systemPrompt?: string;
    contextRole?: MessageType;
  }) {
    super();
    this.chatModel = init.chatModel ?? Settings.llm;
    this.chatHistory = getHistory(init?.chatHistory);
    this.contextGenerator = new DefaultContextGenerator({
      retriever: init.retriever,
      contextSystemPrompt: init?.contextSystemPrompt,
      nodePostprocessors: init?.nodePostprocessors,
      contextRole: init?.contextRole,
      metadataMode: MetadataMode.LLM,
    });
    this.systemPrompt = init.systemPrompt;
  }

  protected _getPrompts(): PromptsRecord {
    return {
      ...this.contextGenerator.getPrompts(),
    };
  }

  protected _updatePrompts(prompts: { contextSystemPrompt: ContextSystemPrompt }): void {
    this.contextGenerator.updatePrompts(prompts);
  }

  protected _getPromptModules(): ModuleRecord {
    return {
      contextGenerator: this.contextGenerator,
    };
  }

  chat(
    params: ChatEngineParamsStreaming,
  ): Promise<AsyncIterable<EngineResponse>>;
  chat(params: ChatEngineParamsNonStreaming): Promise<EngineResponse>;
  @wrapEventCaller
  async chat(
    params: ChatEngineParamsStreaming | ChatEngineParamsNonStreaming,
  ): Promise<EngineResponse | AsyncIterable<EngineResponse>> {
    const { message, stream } = params;
    const chatHistory = params.chatHistory
      ? getHistory(params.chatHistory)
      : this.chatHistory;
    const requestMessages = await this.prepareRequestMessages(
      message,
      chatHistory,
    );
    if (stream) {
      const stream = await this.chatModel.chat({
        messages: requestMessages.messages,
        stream: true,
      });
      return streamConverter(
        streamReducer({
          stream,
          initialValue: "",
          reducer: (accumulator, part) => (accumulator += part.delta),
          finished: (accumulator) => {
            chatHistory.addMessage({ content: accumulator, role: "assistant" });
          },
        }),
        (r) => EngineResponse.fromChatResponseChunk(r, requestMessages.nodes),
      );
    }
    const response = await this.chatModel.chat({
      messages: requestMessages.messages,
    });
    chatHistory.addMessage(response.message);
    return EngineResponse.fromChatResponse(response, requestMessages.nodes);
  }

  reset() {
    this.chatHistory.reset();
  }

  private async prepareRequestMessages(
    message: MessageContent,
    chatHistory: ChatHistory,
  ) {
    chatHistory.addMessage({
      content: message,
      role: "user",
    });
    const textOnly = extractText(message);
    const context = await this.contextGenerator.generate(textOnly);
    const systemMessage = this.prependSystemPrompt(context.message);
    const messages = await chatHistory.requestMessages([systemMessage]);
    return { nodes: context.nodes, messages };
  }

  private prependSystemPrompt(message: ChatMessage): ChatMessage {
    if (!this.systemPrompt) return message;
    return {
      ...message,
      content: this.systemPrompt.trim() + "\n" + extractText(message.content),
    };
  }
}
