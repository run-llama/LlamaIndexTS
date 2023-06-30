import { TextNode } from "./Node";

export class Response {
  response?: string;
  sourceNodes: TextNode[];

  constructor(response?: string, sourceNodes?: TextNode[]) {
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
