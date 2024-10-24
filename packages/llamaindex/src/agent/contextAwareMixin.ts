import { type AgentRunner } from "@llamaindex/core/agent";
import type {
  NonStreamingChatEngineParams,
  StreamingChatEngineParams,
} from "@llamaindex/core/chat-engine";
import type { ChatMessage, LLM, MessageContent } from "@llamaindex/core/llms";
import type { BaseRetriever } from "@llamaindex/core/retriever";
import type { NodeWithScore } from "@llamaindex/core/schema";
import { EngineResponse, MetadataMode } from "@llamaindex/core/schema";

type Constructor<T = {}> = new (...args: any[]) => T;

export interface ContextAwareConfig {
  contextRetriever: BaseRetriever;
}

export interface ContextAwareAgentRunner extends AgentRunner<LLM> {
  contextRetriever: BaseRetriever;
  retrievedContext: string | null;
  retrieveContext(query: MessageContent): Promise<string>;
  injectContext(context: string): Promise<void>;
}

/**
 * ContextAwareAgentRunner enhances the base AgentRunner with the ability to retrieve and inject relevant context
 * for each query. This allows the agent to access and utilize appropriate information from a given index or retriever,
 * providing more informed and context-specific responses to user queries.
 */
export function withContextAwareness<T extends Constructor<AgentRunner<LLM>>>(
  BaseClass: T,
) {
  return class extends BaseClass implements ContextAwareAgentRunner {
    contextRetriever: BaseRetriever;
    retrievedContext: string | null = null;

    constructor(...args: any[]) {
      super(...args);
      const config = args[args.length - 1] as ContextAwareConfig;
      this.contextRetriever = config.contextRetriever;
    }

    createStore(): object {
      return {};
    }

    async retrieveContext(query: MessageContent): Promise<string> {
      const nodes = await this.contextRetriever.retrieve({ query });
      return nodes
        .map((node: NodeWithScore) => node.node.getContent(MetadataMode.NONE))
        .join("\n");
    }

    async injectContext(context: string): Promise<void> {
      const chatHistory = (this as any).chatHistory as ChatMessage[];
      const systemMessage = chatHistory.find((msg) => msg.role === "system");
      if (systemMessage) {
        systemMessage.content = `${context}\n\n${systemMessage.content}`;
      } else {
        chatHistory.unshift({ role: "system", content: context });
      }
    }

    async chat(params: NonStreamingChatEngineParams): Promise<EngineResponse>;
    async chat(
      params: StreamingChatEngineParams,
    ): Promise<ReadableStream<EngineResponse>>;
    async chat(
      params: NonStreamingChatEngineParams | StreamingChatEngineParams,
    ): Promise<EngineResponse | ReadableStream<EngineResponse>> {
      const context = await this.retrieveContext(params.message);
      await this.injectContext(context);

      if ("stream" in params && params.stream === true) {
        return super.chat(params);
      } else {
        return super.chat(params as NonStreamingChatEngineParams);
      }
    }
  };
}
