import type { NodeWithScore } from "./Node.js";
import type {
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
} from "./llm/types.js";
import { extractText } from "./llm/utils.js";

export class EngineResponse implements ChatResponse {
  sourceNodes?: NodeWithScore[];
  // TODO: remove and put in options of message?
  metadata: Record<string, unknown> = {};

  message: ChatMessage;
  raw: object | null;

  private constructor(
    chatResponse: ChatResponse,
    sourceNodes?: NodeWithScore[],
  ) {
    this.message = chatResponse.message;
    this.raw = chatResponse.raw;
    this.sourceNodes = sourceNodes;
  }

  static fromResponse(
    response: string,
    sourceNodes?: NodeWithScore[],
  ): EngineResponse {
    return new EngineResponse(
      EngineResponse.toChatResponse(response),
      sourceNodes,
    );
  }

  private static toChatResponse(
    response: string,
    raw: object | null = null,
  ): ChatResponse {
    return {
      message: {
        content: response,
        role: "assistant",
      },
      raw,
    };
  }

  static fromChatResponse(
    chatResponse: ChatResponse,
    sourceNodes?: NodeWithScore[],
  ): EngineResponse {
    return new EngineResponse(chatResponse, sourceNodes);
  }

  static fromChatResponseChunk(
    chunk: ChatResponseChunk,
    sourceNodes?: NodeWithScore[],
  ): EngineResponse {
    return new EngineResponse(
      this.toChatResponse(chunk.delta, chunk.raw),
      sourceNodes,
    );
  }

  // @deprecated use 'message' instead
  get response(): string {
    return extractText(this.message.content);
  }

  // TODO: consider storing delta separately
  get delta(): string {
    return extractText(this.message.content);
  }

  toString() {
    return this.response ?? "";
  }
}
