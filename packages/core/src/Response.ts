import type { NodeWithScore } from "./Node.js";
import type { ChatMessage, ChatResponse } from "./llm/types.js";

export class Response implements ChatResponse {
  // @deprecated use 'message' instead
  response: string;
  sourceNodes?: NodeWithScore[];
  metadata: Record<string, unknown> = {};

  message: ChatMessage;
  raw: object | null;

  constructor(
    response: string,
    sourceNodes?: NodeWithScore[],
    chatResponse?: ChatResponse,
  ) {
    this.response = response;
    this.sourceNodes = sourceNodes || [];
    this.message = chatResponse?.message ?? {
      content: response,
      role: "assistant",
    };
    this.raw = chatResponse?.raw ?? null;
  }

  protected _getFormattedSources() {
    throw new Error("Not implemented yet");
  }

  toString() {
    return this.response ?? "";
  }
}
