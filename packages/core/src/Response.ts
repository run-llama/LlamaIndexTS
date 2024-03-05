import type { BaseNode } from "./Node.js";

/**
 * Response is the output of a LLM
 */
export class Response {
  response: string;
  sourceNodes?: BaseNode[];
  metadata: Record<string, unknown> = {};

  constructor(response: string, sourceNodes?: BaseNode[]) {
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
