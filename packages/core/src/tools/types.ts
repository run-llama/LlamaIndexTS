export class ToolOutput {
  content: string;
  toolName: string;
  rawInput: any;
  rawOutput: any;

  constructor(
    content: string,
    toolName: string,
    rawInput: any,
    rawOutput: any,
  ) {
    this.content = content;
    this.toolName = toolName;
    this.rawInput = rawInput;
    this.rawOutput = rawOutput;
  }

  toString(): string {
    return this.content;
  }
}
