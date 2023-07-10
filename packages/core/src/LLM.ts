import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAISession,
  OpenAIWrapper,
  getOpenAISession,
} from "./openai";

export interface BaseLanguageModel {}

type MessageType = "user" | "assistant" | "system" | "generic" | "function";

export interface ChatMessage {
  content: string;
  role: MessageType;
}

export interface ChatResponse {
  message: ChatMessage;
  raw?: Record<string, any>;
  delta?: string;
}

// NOTE in case we need CompletionResponse to diverge from ChatResponse in the future
export type CompletionResponse = ChatResponse;

export interface LLM {
  achat(messages: ChatMessage[]): Promise<ChatResponse>;
  acomplete(prompt: string): Promise<CompletionResponse>;
}

const GPT4_MODELS = {
  "gpt-4": 8192,
  "gpt-4-32k": 32768,
};

const TURBO_MODELS = {
  "gpt-3.5-turbo": 4096,
  "gpt-3.5-turbo-16k": 16384,
};

const ALL_AVAILABLE_MODELS = {
  ...GPT4_MODELS,
  ...TURBO_MODELS,
};

export class OpenAI implements LLM {
  model: string;
  temperature: number = 0;
  requestTimeout: number | null = null;
  maxRetries: number = 6;
  n: number = 1;
  maxTokens?: number;
  openAIKey: string | null = null;
  session: OpenAISession;

  constructor(model: string = "gpt-3.5-turbo") {
    // NOTE default model is different from Python
    this.model = model;
    this.session = getOpenAISession(this.openAIKey);
  }

  static mapMessageType(
    type: MessageType
  ): ChatCompletionRequestMessageRoleEnum {
    switch (type) {
      case "user":
        return "user";
      case "assistant":
        return "assistant";
      case "system":
        return "system";
      case "function":
        return "function";
      default:
        return "user";
    }
  }

  async achat(messages: ChatMessage[]): Promise<ChatResponse> {}

  async acomplete(messages: ChatMessage[]): Promise<ChatResponse> {
    const { data } = await this.session.openai.createChatCompletion({
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      n: this.n,
      messages: messages.map((message) => ({
        role: OpenAI.mapMessageType(message.role),
        content: message.content,
      })),
    });

    const content = data.choices[0].message?.content ?? "";
    return { generations: [[{ text: content }]] };
  }
}
