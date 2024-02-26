import type { ChatMessage } from "../../llm/index.js";
import type { BaseTool } from "../../types.js";
import { getReactChatSystemHeader } from "./prompts.js";
import type { BaseReasoningStep } from "./types.js";
import { ObservationReasoningStep } from "./types.js";

function getReactToolDescriptions(tools: BaseTool[]): string[] {
  const toolDescs: string[] = [];
  for (const tool of tools) {
    // @ts-ignore
    const toolDesc = `> Tool Name: ${tool.metadata.name}\nTool Description: ${tool.metadata.description}\nTool Args: ${JSON.stringify(tool?.metadata?.parameters?.properties)}\n`;
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
      toolDesc: getReactToolDescriptions(tools).join("\n"),
      toolNames: tools.map((tool) => tool.metadata.name).join(", "),
      context: "",
    };

    if (this.context) {
      formatArgs["context"] = this.context;
    }

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

    const systemContent = getReactChatSystemHeader({
      toolDesc: formatArgs.toolDesc,
      toolNames: formatArgs.toolNames,
    });

    return [
      {
        content: systemContent,
        role: "system",
      },
      ...chatHistory,
      ...reasoningHistory,
    ];
  }
}
