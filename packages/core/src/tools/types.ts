export class ToolOutput {
  content: string;
  tool_name: string;
  raw_input: any;
  raw_output: any;

  constructor(
    content: string,
    tool_name: string,
    raw_input: any,
    raw_output: any,
  ) {
    this.content = content;
    this.tool_name = tool_name;
    this.raw_input = raw_input;
    this.raw_output = raw_output;
  }

  toString(): string {
    return this.content;
  }
}
