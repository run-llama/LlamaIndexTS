import { wrapEventCaller } from "../decorator";
import { Settings } from "../global";
import type { ChatMessage, LLM, MessageContent, MessageType } from "../llms";
import { Memory } from "../memory";
import type { BaseNodePostprocessor } from "../postprocessor";
import {
  type ContextSystemPrompt,
  type ModuleRecord,
  PromptMixin,
  type PromptsRecord,
} from "../prompts";
import type { BaseRetriever } from "../retriever";
import { EngineResponse, MetadataMode } from "../schema";
import { extractText, streamConverter, streamReducer } from "../utils";
import type {
  BaseChatEngine,
  NonStreamingChatEngineParams,
  StreamingChatEngineParams,
} from "./base";
import { DefaultContextGenerator } from "./default-context-generator";
import type { ContextGenerator } from "./type";

export type ContextChatEngineOptions = {
  retriever: BaseRetriever;
  chatModel?: LLM | undefined;
  chatHistory?: ChatMessage[] | Memory | undefined;
  contextSystemPrompt?: ContextSystemPrompt | undefined;
  nodePostprocessors?: BaseNodePostprocessor[] | undefined;
  systemPrompt?: string | undefined;
  contextRole?: MessageType | undefined;
};

/**
 * ContextChatEngine uses the Index to get the appropriate context for each query.
 * The context is stored in the system prompt, and the chat history is chunk,
 * allowing the appropriate context to be surfaced for each query.
 */
export class ContextChatEngine extends PromptMixin implements BaseChatEngine {
  chatModel: LLM;
  memory: Memory;
  contextGenerator: ContextGenerator & PromptMixin;
  systemPrompt?: string | undefined;

  get chatHistory() {
    return this.memory.getLLM();
  }

  constructor(init: ContextChatEngineOptions) {
    super();
    this.chatModel = init.chatModel ?? Settings.llm;
    this.memory =
      init?.chatHistory instanceof Memory
        ? init.chatHistory
        : Memory.fromChatMessages(init?.chatHistory ?? []);
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
      ? params.chatHistory instanceof Memory
        ? params.chatHistory
        : Memory.fromChatMessages(params.chatHistory)
      : this.memory;
    const requestMessages = await this.prepareRequestMessages(
      message,
      chatHistory,
    );
    if (stream) {
      const stream = await this.chatModel.chat({
        messages: requestMessages.messages,
        stream: true,
        additionalChatOptions: params.chatOptions as object,
      });
      return streamConverter(
        streamReducer({
          stream,
          initialValue: "",
          reducer: (accumulator, part) => (accumulator += part.delta),
          finished: (accumulator) => {
            void chatHistory.add({ content: accumulator, role: "assistant" });
          },
        }),
        (r) => EngineResponse.fromChatResponseChunk(r, requestMessages.nodes),
      );
    }
    const response = await this.chatModel.chat({
      messages: requestMessages.messages,
      additionalChatOptions: params.chatOptions as object,
    });
    await chatHistory.add(response.message);
    return EngineResponse.fromChatResponse(response, requestMessages.nodes);
  }

  async reset() {
    await this.memory.clear();
  }

  private async prepareRequestMessages(
    message: MessageContent,
    chatHistory: Memory,
  ) {
    await chatHistory.add({
      content: message,
      role: "user",
    });
    const textOnly = extractText(message);
    const context = await this.contextGenerator.generate(textOnly);
    const systemMessage = this.prependSystemPrompt(context.message);
    const messages = await chatHistory.getLLM(this.chatModel, [systemMessage]);
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
