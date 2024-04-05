import type { AgentWorker } from '../types.js'
import type { ChatMessage } from '../../llm/types.js'
import { Anthropic } from '../../llm/index.js'
import type { BaseTool } from '../../types.js'
import type { ObjectRetriever } from '../../objects/base.js'

type ChatParams = {
  messages: ChatMessage[]
  tools: BaseTool[]
}

type AnthropicAgentWorkerParams = {
  tools: BaseTool[]
  llm: Anthropic
  prefixMessages?: ChatMessage[]
  verbose: boolean
  maxFunctionCalls: number
  toolRetriever?: ObjectRetriever
}

export class AnthropicAgentWorker implements AgentWorker<ChatParams> {
  private llm: Anthropic;
  private verbose: boolean;
  private maxFunctionCalls: number = 5;

  public prefixMessages: ChatMessage[];

  private _getTools: (input: string) => Promise<BaseTool[]>;

  constructor({
    tools = [],
    llm,
    prefixMessages,
    verbose,
    maxFunctionCalls,
    toolRetriever,
  }: AnthropicAgentWorkerParams) {
    this.llm = llm;
    this.verbose = verbose;
    this.maxFunctionCalls = maxFunctionCalls;
    this.prefixMessages = prefixMessages ?? [];

    this._getTools = async (input: string) => {
      if (toolRetriever) {
        return toolRetriever.getTools(input);
      }
      return tools;
    };
  }
}