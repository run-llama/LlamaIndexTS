import type { NodeWithScore } from "./Node.js";

/**
 * Response is the output of a LLM
 */
export class Response {
  response: string;
  sourceNodes?: NodeWithScore[];
  metadata: Record<string, unknown> = {};

  constructor(response: string, sourceNodes?: NodeWithScore[]) {
    this.response = response;
    this.sourceNodes = sourceNodes || [];
  }

  protected _getFormattedSources() {
    throw new Error("Not implemented yet");
  }

  toString() {
    return this.response ?? "";
  }
}
