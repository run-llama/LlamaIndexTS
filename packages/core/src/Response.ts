import { Node } from "./Node";

export class Response {
  response?: string;
  sourceNodes: Node[];

  constructor(response?: string, sourceNodes?: Node[]) {
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
