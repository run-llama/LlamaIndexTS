import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAISession,
  OpenAIWrapper,
  getOpenAISession,
} from "./openai";

export interface BaseLanguageModel {}

type MessageType = "human" | "ai" | "system" | "generic" | "function";

export interface BaseMessage {
  content: string;
  type: MessageType;
}

interface Generation {
  text: string;
  generationInfo?: Record<string, any>;
}

export interface LLMResult {
  generations: Generation[][]; // Each input can have more than one generations
}

export interface BaseChatModel extends BaseLanguageModel {
  agenerate(messages: BaseMessage[]): Promise<LLMResult>;
}

export class ChatOpenAI implements BaseChatModel {
  model: string;
  temperature: number = 0.7;
  openAIKey: string | null = null;
  requestTimeout: number | null = null;
  maxRetries: number = 6;
  n: number = 1;
  maxTokens?: number;

  session: OpenAISession;

  constructor(model: string = "gpt-3.5-turbo") {
    this.model = model;
    this.session = getOpenAISession();
  }

  static mapMessageType(
    type: MessageType
  ): ChatCompletionRequestMessageRoleEnum {
    switch (type) {
      case "human":
        return "user";
      case "ai":
        return "assistant";
      case "system":
        return "system";
      case "function":
        return "function";
      default:
        return "user";
    }
  }

  async agenerate(messages: BaseMessage[]): Promise<LLMResult> {
    const { data } = await this.session.openai.createChatCompletion({
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      n: this.n,
      messages: messages.map((message) => ({
        role: ChatOpenAI.mapMessageType(message.type),
        content: message.content,
      })),
    });

    const content = data.choices[0].message?.content ?? "";
    return { generations: [[{ text: content }]] };
  }
}
