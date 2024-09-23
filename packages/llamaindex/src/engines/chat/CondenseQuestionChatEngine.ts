import {
  BaseChatEngine,
  type NonStreamingChatEngineParams,
  type StreamingChatEngineParams,
} from "@llamaindex/core/chat-engine";
import type { ChatMessage, LLM } from "@llamaindex/core/llms";
import { BaseMemory, ChatMemoryBuffer } from "@llamaindex/core/memory";
import {
  type CondenseQuestionPrompt,
  defaultCondenseQuestionPrompt,
  type ModuleRecord,
} from "@llamaindex/core/prompts";
import type { BaseQueryEngine } from "@llamaindex/core/query-engine";
import type { EngineResponse } from "@llamaindex/core/schema";
import {
  extractText,
  messagesToHistory,
  streamReducer,
  wrapEventCaller,
} from "@llamaindex/core/utils";
import type { ServiceContext } from "../../ServiceContext.js";
import { llmFromSettingsOrContext } from "../../Settings.js";

/**
 * CondenseQuestionChatEngine is used in conjunction with a Index (for example VectorStoreIndex).
 * It does two steps on taking a user's chat message: first, it condenses the chat message
 * with the previous chat history into a question with more context.
 * Then, it queries the underlying Index using the new question with context and returns
 * the response.
 * CondenseQuestionChatEngine performs well when the input is primarily questions about the
 * underlying data. It performs less well when the chat messages are not questions about the
 * data, or are very referential to previous context.
 */
export class CondenseQuestionChatEngine extends BaseChatEngine {
  queryEngine: BaseQueryEngine;
  memory: BaseMemory;
  llm: LLM;
  condenseMessagePrompt: CondenseQuestionPrompt;

  get chatHistory() {
    return this.memory.getMessages();
  }

  constructor(init: {
    queryEngine: BaseQueryEngine;
    chatHistory: ChatMessage[];
    serviceContext?: ServiceContext;
    condenseMessagePrompt?: CondenseQuestionPrompt;
  }) {
    super();

    this.queryEngine = init.queryEngine;
    this.memory = new ChatMemoryBuffer({
      chatHistory: init?.chatHistory,
    });
    this.llm = llmFromSettingsOrContext(init?.serviceContext);
    this.condenseMessagePrompt =
      init?.condenseMessagePrompt ?? defaultCondenseQuestionPrompt;
  }

  protected _getPromptModules(): ModuleRecord {
    return {};
  }

  protected _getPrompts(): { condenseMessagePrompt: CondenseQuestionPrompt } {
    return {
      condenseMessagePrompt: this.condenseMessagePrompt,
    };
  }

  protected _updatePrompts(promptsDict: {
    condenseMessagePrompt: CondenseQuestionPrompt;
  }): void {
    if (promptsDict.condenseMessagePrompt) {
      this.condenseMessagePrompt = promptsDict.condenseMessagePrompt;
    }
  }

  private async condenseQuestion(chatHistory: BaseMemory, question: string) {
    const chatHistoryStr = messagesToHistory(await chatHistory.getMessages());

    return this.llm.complete({
      prompt: this.condenseMessagePrompt.format({
        question: question,
        chatHistory: chatHistoryStr,
      }),
    });
  }

  chat(params: NonStreamingChatEngineParams): Promise<EngineResponse>;
  chat(
    params: StreamingChatEngineParams,
  ): Promise<AsyncIterable<EngineResponse>>;
  @wrapEventCaller
  async chat(
    params: NonStreamingChatEngineParams | StreamingChatEngineParams,
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

    const condensedQuestion = (
      await this.condenseQuestion(chatHistory, extractText(message))
    ).text;
    chatHistory.put({ content: message, role: "user" });

    if (stream) {
      const stream = await this.queryEngine.query({
        query: condensedQuestion,
        stream: true,
      });
      return streamReducer({
        stream,
        initialValue: "",
        reducer: (accumulator, part) =>
          (accumulator += extractText(part.message.content)),
        finished: (accumulator) => {
          chatHistory.put({ content: accumulator, role: "assistant" });
        },
      });
    }
    const response = await this.queryEngine.query({
      query: condensedQuestion,
    });
    chatHistory.put({
      content: response.message.content,
      role: "assistant",
    });

    return response;
  }

  reset() {
    this.memory.reset();
  }
}
