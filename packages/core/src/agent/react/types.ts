import { ChatMessage } from "../../llm";

export interface BaseReasoningStep {
  getContent(): string;
  isDone(): boolean;
}

export class ObservationReasoningStep implements BaseReasoningStep {
  observation: string;

  constructor(init?: Partial<ObservationReasoningStep>) {
    this.observation = init?.observation ?? "";
  }

  getContent(): string {
    return `Observation: ${this.observation}`;
  }

  isDone(): boolean {
    return false;
  }
}

export class ActionReasoningStep implements BaseReasoningStep {
  thought: string;
  action: string;
  actionInput: Record<string, any>;

  constructor(init?: Partial<ActionReasoningStep>) {
    this.thought = init?.thought ?? "";
    this.action = init?.action ?? "";
    this.actionInput = init?.actionInput ?? {};
  }

  getContent(): string {
    return `Thought: ${this.thought}\nAction: ${this.action}\nAction Input: ${JSON.stringify(this.actionInput)}`;
  }

  isDone(): boolean {
    return false;
  }
}

export abstract class BaseOutputParser {
  abstract parse(output: string, isStreaming?: boolean): BaseReasoningStep;

  format(output: string) {
    return output;
  }

  formatMessages(messages: ChatMessage[]): ChatMessage[] {
    if (messages) {
      if (messages[0].role === "system") {
        messages[0].content = this.format(messages[0].content || "");
      } else {
        messages[messages.length - 1].content = this.format(
          messages[messages.length - 1].content || "",
        );
      }
    }

    return messages;
  }
}

export class ResponseReasoningStep implements BaseReasoningStep {
  thought: string;
  response: string;
  isStreaming: boolean = false;

  constructor(init?: Partial<ResponseReasoningStep>) {
    this.thought = init?.thought ?? "";
    this.response = init?.response ?? "";
    this.isStreaming = init?.isStreaming ?? false;
  }

  getContent(): string {
    if (this.isStreaming) {
      return `Thought: ${this.thought}\nAnswer (Starts With): ${this.response} ...`;
    } else {
      return `Thought: ${this.thought}\nAnswer: ${this.response}`;
    }
  }

  isDone(): boolean {
    return true;
  }
}
