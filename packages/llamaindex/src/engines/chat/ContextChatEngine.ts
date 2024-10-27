import type {
  BaseChatEngine,
  NonStreamingChatEngineParams,
  StreamingChatEngineParams,
} from "@llamaindex/core/chat-engine";
import { wrapEventCaller } from "@llamaindex/core/decorator";
import type {
  ChatMessage,
  LLM,
  MessageContent,
  MessageType,
} from "@llamaindex/core/llms";
import { BaseMemory, ChatMemoryBuffer } from "@llamaindex/core/memory";
import type { BaseNodePostprocessor } from "@llamaindex/core/postprocessor";
import {
  type ContextSystemPrompt,
  type ModuleRecord,
  PromptMixin,
  type PromptsRecord,
} from "@llamaindex/core/prompts";
import type { BaseRetriever } from "@llamaindex/core/retriever";
import { EngineResponse, MetadataMode } from "@llamaindex/core/schema";
import {
  extractText,
  streamConverter,
  streamReducer,
} from "@llamaindex/core/utils";
import { Settings } from "../../Settings.js";
import { DefaultContextGenerator } from "./DefaultContextGenerator.js";
import type { ContextGenerator } from "./types.js";

/**
 * ContextChatEngine uses the Index to get the appropriate context for each query.
 * The context is stored in the system prompt, and the chat history is chunk: ChatResponseChunk, nodes?: NodeWithScore<import("/Users/marcus/code/llamaindex/LlamaIndexTS/packages/core/src/Node").Metadata>[], nodes?: NodeWithScore<import("/Users/marcus/code/llamaindex/LlamaIndexTS/packages/core/src/Node").Metadata>[]lowing the appropriate context to be surfaced for each query.
 */
export class ContextChatEngine extends PromptMixin implements BaseChatEngine {
  chatModel: LLM;
  memory: BaseMemory;
  contextGenerator: ContextGenerator & PromptMixin;
  systemPrompt?: string | undefined;

  get chatHistory() {
    return this.memory.getMessages();
  }

  constructor(init: {
    retriever: BaseRetriever;
    chatModel?: LLM | undefined;
    chatHistory?: ChatMessage[] | undefined;
    contextSystemPrompt?: ContextSystemPrompt | undefined;
    nodePostprocessors?: BaseNodePostprocessor[] | undefined;
    systemPrompt?: string | undefined;
    contextRole?: MessageType | undefined;
  }) {
    super();
    this.chatModel = init.chatModel ?? Settings.llm;
    this.memory = new ChatMemoryBuffer({ chatHistory: init?.chatHistory });
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

  protected _updatePrompts(prompts: {
    contextSystemPrompt: ContextSystemPrompt;
  }): void {
    this.contextGenerator.updatePrompts(prompts);
  }

  protected _getPromptModules(): ModuleRecord {
    return {
      contextGenerator: this.contextGenerator,
    };
  }

  chat(params: NonStreamingChatEngineParams): Promise<EngineResponse>;
  chat(
    params: StreamingChatEngineParams,
  ): Promise<AsyncIterable<EngineResponse>>;
  @wrapEventCaller
  async chat(
    params: StreamingChatEngineParams | NonStreamingChatEngineParams,
  ): Promise<EngineResponse | AsyncIterable<EngineResponse>> {
    const { message, stream } = params;
    const chatHistory = params.chatHistory
      ? new ChatMemoryBuffer({
          chatHistory:
            params.chatHistory instanceof BaseMemory
              ? await params.chatHistory.getMessages()
              : params.chatHistory,
        })
      : this.memory;
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
            chatHistory.put({ content: accumulator, role: "assistant" });
          },
        }),
        (r) => EngineResponse.fromChatResponseChunk(r, requestMessages.nodes),
      );
    }
    const response = await this.chatModel.chat({
      messages: requestMessages.messages,
    });
    chatHistory.put(response.message);
    return EngineResponse.fromChatResponse(response, requestMessages.nodes);
  }

  reset() {
    this.memory.reset();
  }

  private async prepareRequestMessages(
    message: MessageContent,
    chatHistory: BaseMemory,
  ) {
    chatHistory.put({
      content: message,
      role: "user",
    });
    const textOnly = extractText(message);
    const context = await this.contextGenerator.generate(textOnly);
    const systemMessage = this.prependSystemPrompt(context.message);
    const messages = await chatHistory.getMessages([systemMessage]);
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
