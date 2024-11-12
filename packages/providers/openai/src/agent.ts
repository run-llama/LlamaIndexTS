import {
  LLMAgent,
  LLMAgentWorker,
  type LLMAgentParams,
} from "@llamaindex/core/agent";
import { Settings } from "@llamaindex/core/global";
import { OpenAI, type OpenAIAdditionalChatOptions } from "./llm";

// This is likely not necessary anymore but leaving it here just in case it's in use elsewhere

export type OpenAIAgentParams = LLMAgentParams &
  (
    | {
        toolChoice: OpenAIAdditionalChatOptions["tool_choice"];
      }
    | {
        tool_choice: OpenAIAdditionalChatOptions["tool_choice"];
      }
  );

export class OpenAIAgentWorker extends LLMAgentWorker {}

export class OpenAIAgent extends LLMAgent {
  constructor(params: OpenAIAgentParams) {
    const llm =
      params.llm ??
      (Settings.llm instanceof OpenAI
        ? (Settings.llm as OpenAI)
        : new OpenAI());
    super({
      ...params,
      llm,
      additionalChatOptions: {
        tool_choice:
          "toolChoice" in params ? params.toolChoice : params.tool_choice,
      },
    });
  }
}
