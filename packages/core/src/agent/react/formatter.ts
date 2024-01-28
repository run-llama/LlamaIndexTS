import { BaseTool } from "../../Tool";
import { ChatMessage } from "../../llm";
import { BaseReasoningStep, ObservationReasoningStep } from "./types";

function getReactToolDescriptions(tools: BaseTool[]): string[] {
  const toolDescs: string[] = [];
  for (const tool of tools) {
    // @ts-ignore
    const toolDesc = `> Tool Name: ${tool.metadata.name}\nTool Description: ${tool.metadata.description}\nTool Args: ${tool?.metadata?.fn_schema_str}\n`;
    toolDescs.push(toolDesc);
  }
  return toolDescs;
}

export interface BaseAgentChatFormatter {
  format(
    tools: BaseTool[],
    chatHistory: ChatMessage[],
    currentReasoning?: BaseReasoningStep[],
  ): ChatMessage[];
}

export class ReActChatFormatter implements BaseAgentChatFormatter {
  systemHeader: string = "";
  context: string = "'";

  constructor(init?: Partial<ReActChatFormatter>) {
    Object.assign(this, init);
  }

  format(
    tools: BaseTool[],
    chatHistory: ChatMessage[],
    currentReasoning?: BaseReasoningStep[],
  ): ChatMessage[] {
    currentReasoning = currentReasoning ?? [];

    const formatArgs = {
      toolDesc: "",
      toolNames: "",
      context: "",
    };

    if (this.context) {
      formatArgs["context"] = this.context;
    }

    const fmtSysHeader = null;

    const reasoningHistory = [];

    for (const reasoningStep of currentReasoning) {
      let message: ChatMessage | undefined;

      if (reasoningStep instanceof ObservationReasoningStep) {
        message = {
          content: reasoningStep.getContent(),
          role: "user",
        };
      } else {
        message = {
          content: reasoningStep.getContent(),
          role: "system",
        };
      }

      reasoningHistory.push(message);
    }

    return [
      {
        content: this.systemHeader,
        role: "system",
      },
      ...reasoningHistory,
      ...chatHistory,
    ];
  }
}
