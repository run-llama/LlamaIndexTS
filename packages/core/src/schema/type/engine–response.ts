import type { ChatMessage, ChatResponse, ChatResponseChunk } from "../../llms";
import { extractText } from "../../utils";
import type { Metadata, NodeWithScore } from "../node";

export class EngineResponse implements ChatResponse, ChatResponseChunk {
  sourceNodes: NodeWithScore[] | undefined;

  metadata: Metadata = {};

  message: ChatMessage;
  raw: object | null;

  readonly stream: boolean;

  private constructor(
    chatResponse: ChatResponse,
    stream: boolean,
    sourceNodes?: NodeWithScore[],
  ) {
    this.message = chatResponse.message;
    this.raw = chatResponse.raw;
    this.sourceNodes = sourceNodes;
    this.stream = stream;
  }

  static fromResponse(
    response: string,
    stream: boolean,
    sourceNodes?: NodeWithScore[],
  ): EngineResponse {
    return new EngineResponse(
      EngineResponse.toChatResponse(response),
      stream,
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
    return new EngineResponse(chatResponse, false, sourceNodes);
  }

  static fromChatResponseChunk(
    chunk: ChatResponseChunk,
    sourceNodes?: NodeWithScore[],
  ): EngineResponse {
    return new EngineResponse(
      EngineResponse.toChatResponse(chunk.delta, chunk.raw),
      true,
      sourceNodes,
    );
  }

  /**
   * @deprecated Use `message` instead.
   */
  get response(): string {
    return extractText(this.message.content);
  }

  get delta(): string {
    if (!this.stream) {
      console.warn(
        "delta is only available for streaming responses. Consider using 'message' instead.",
      );
    }
    return extractText(this.message.content);
  }

  toString(): string {
    return this.response ?? "";
  }
}
