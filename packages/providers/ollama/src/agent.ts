import {
  LLMAgent,
  LLMAgentWorker,
  type LLMAgentParams,
} from "@llamaindex/core/agent";
import { Settings } from "@llamaindex/core/global";
import { Ollama } from "./llm";

// This is likely not necessary anymore but leaving it here just incase it's in use elsewhere

export type OllamaAgentParams = LLMAgentParams<Ollama> & {
  model?: string;
};

export class OllamaAgentWorker extends LLMAgentWorker {}

export class OllamaAgent extends LLMAgent {
  constructor(params: OllamaAgentParams) {
    const llm =
      params.llm ??
      (Settings.llm instanceof Ollama
        ? (Settings.llm as Ollama)
        : !params.model
          ? (() => {
              throw new Error("No model provided");
            })()
          : new Ollama({ model: params.model }));
    super({
      ...params,
      llm,
    });
  }
}
