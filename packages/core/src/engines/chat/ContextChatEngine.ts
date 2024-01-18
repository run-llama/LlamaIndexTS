import { randomUUID } from "node:crypto";
import { ChatHistory, getHistory } from "../../ChatHistory";
import { ContextSystemPrompt } from "../../Prompt";
import { Response } from "../../Response";
import { BaseRetriever } from "../../Retriever";
import { Event } from "../../callbacks/CallbackManager";
import { ChatMessage, ChatResponseChunk, LLM, OpenAI } from "../../llm";
import { MessageContent } from "../../llm/types";
import { extractText, streamConverter, streamReducer } from "../../llm/utils";
import { BaseNodePostprocessor } from "../../postprocessors";
import { DefaultContextGenerator } from "./DefaultContextGenerator";
import {
  ChatEngine,
  ChatEngineParamsNonStreaming,
  ChatEngineParamsStreaming,
  ContextGenerator,
} from "./types";

/**
 * ContextChatEngine uses the Index to get the appropriate context for each query.
 * The context is stored in the system prompt, and the chat history is preserved,
 * ideally allowing the appropriate context to be surfaced for each query.
 */
export class ContextChatEngine implements ChatEngine {
  chatModel: LLM;
  chatHistory: ChatHistory;
  contextGenerator: ContextGenerator;

  constructor(init: {
    retriever: BaseRetriever;
    chatModel?: LLM;
    chatHistory?: ChatMessage[];
    contextSystemPrompt?: ContextSystemPrompt;
    nodePostprocessors?: BaseNodePostprocessor[];
  }) {
    this.chatModel =
      init.chatModel ?? new OpenAI({ model: "gpt-3.5-turbo-16k" });
    this.chatHistory = getHistory(init?.chatHistory);
    this.contextGenerator = new DefaultContextGenerator({
      retriever: init.retriever,
      contextSystemPrompt: init?.contextSystemPrompt,
      nodePostprocessors: init?.nodePostprocessors,
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
    const parentEvent: Event = {
      id: randomUUID(),
      type: "wrapper",
      tags: ["final"],
    };
    const requestMessages = await this.prepareRequestMessages(
      message,
      chatHistory,
      parentEvent,
    );

    if (stream) {
      const stream = await this.chatModel.chat({
        messages: requestMessages.messages,
        parentEvent,
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
        (r: ChatResponseChunk) => new Response(r.delta, requestMessages.nodes),
      );
    }
    const response = await this.chatModel.chat({
      messages: requestMessages.messages,
      parentEvent,
    });
    chatHistory.addMessage(response.message);
    return new Response(response.message.content, requestMessages.nodes);
  }

  reset() {
    this.chatHistory.reset();
  }

  private async prepareRequestMessages(
    message: MessageContent,
    chatHistory: ChatHistory,
    parentEvent?: Event,
  ) {
    chatHistory.addMessage({
      content: message,
      role: "user",
    });
    const textOnly = extractText(message);
    const context = await this.contextGenerator.generate(textOnly, parentEvent);
    const nodes = context.nodes.map((r) => r.node);
    const messages = await chatHistory.requestMessages(
      context ? [context.message] : undefined,
    );
    return { nodes, messages };
  }
}
