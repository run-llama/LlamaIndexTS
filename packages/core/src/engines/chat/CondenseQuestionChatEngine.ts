import { ChatHistory, getHistory } from "../../ChatHistory.js";
import {
  CondenseQuestionPrompt,
  defaultCondenseQuestionPrompt,
  messagesToHistoryStr,
} from "../../Prompt.js";
import { Response } from "../../Response.js";
import {
  ServiceContext,
  serviceContextFromDefaults,
} from "../../ServiceContext.js";
import { ChatMessage, LLM } from "../../llm/index.js";
import { extractText, streamReducer } from "../../llm/utils.js";
import { PromptMixin } from "../../prompts/index.js";
import { BaseQueryEngine } from "../../types.js";
import {
  ChatEngine,
  ChatEngineParamsNonStreaming,
  ChatEngineParamsStreaming,
} from "./types.js";

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

export class CondenseQuestionChatEngine
  extends PromptMixin
  implements ChatEngine
{
  queryEngine: BaseQueryEngine;
  chatHistory: ChatHistory;
  llm: LLM;
  condenseMessagePrompt: CondenseQuestionPrompt;

  constructor(init: {
    queryEngine: BaseQueryEngine;
    chatHistory: ChatMessage[];
    serviceContext?: ServiceContext;
    condenseMessagePrompt?: CondenseQuestionPrompt;
  }) {
    super();

    this.queryEngine = init.queryEngine;
    this.chatHistory = getHistory(init?.chatHistory);
    this.llm = init?.serviceContext?.llm ?? serviceContextFromDefaults().llm;
    this.condenseMessagePrompt =
      init?.condenseMessagePrompt ?? defaultCondenseQuestionPrompt;
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

  private async condenseQuestion(chatHistory: ChatHistory, question: string) {
    const chatHistoryStr = messagesToHistoryStr(
      await chatHistory.requestMessages(),
    );

    return this.llm.complete({
      prompt: this.condenseMessagePrompt({
        question: question,
        chatHistory: chatHistoryStr,
      }),
    });
  }

  chat(params: ChatEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  chat(params: ChatEngineParamsNonStreaming): Promise<Response>;
  async chat(
    params: ChatEngineParamsStreaming | ChatEngineParamsNonStreaming,
  ): Promise<Response | AsyncIterable<Response>> {
    const { message, stream } = params;
    const chatHistory = params.chatHistory
      ? getHistory(params.chatHistory)
      : this.chatHistory;

    const condensedQuestion = (
      await this.condenseQuestion(chatHistory, extractText(message))
    ).text;
    chatHistory.addMessage({ content: message, role: "user" });

    if (stream) {
      const stream = await this.queryEngine.query({
        query: condensedQuestion,
        stream: true,
      });
      return streamReducer({
        stream,
        initialValue: "",
        reducer: (accumulator, part) => (accumulator += part.response),
        finished: (accumulator) => {
          chatHistory.addMessage({ content: accumulator, role: "assistant" });
        },
      });
    }
    const response = await this.queryEngine.query({
      query: condensedQuestion,
    });
    chatHistory.addMessage({ content: response.response, role: "assistant" });

    return response;
  }

  reset() {
    this.chatHistory.reset();
  }
}
