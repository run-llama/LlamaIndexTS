import { BaseNode } from "./Node";

/**
 * Respone is the output of a LLM
 */
export class Response {
  response: string;
  sourceNodes?: BaseNode[];

  constructor(response: string, sourceNodes?: BaseNode[]) {
    this.response = response;
    this.sourceNodes = sourceNodes || [];
  }

  getFormattedSources() {
    throw new Error("Not implemented yet");
  }

  toString() {
    return this.response ?? "";
  }
}
