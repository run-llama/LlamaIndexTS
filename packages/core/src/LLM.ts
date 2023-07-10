import { CallbackManager, Event } from "./callbacks/CallbackManager";
import { aHandleOpenAIStream } from "./callbacks/utility/aHandleOpenAIStream";
import {
  ChatCompletionRequestMessageRoleEnum,
  CreateChatCompletionRequest,
  OpenAISession,
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
  callbackManager?: CallbackManager;

  constructor({
    model = "gpt-3.5-turbo",
    callbackManager,
  }: {
    model: string;
    callbackManager?: CallbackManager;
  }) {
    this.model = model;
    this.callbackManager = callbackManager;
    this.session = getOpenAISession();
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
  async agenerate(
    messages: BaseMessage[],
    parentEvent?: Event
  ): Promise<LLMResult> {
    const baseRequestParams: CreateChatCompletionRequest = {
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      n: this.n,
      messages: messages.map((message) => ({
        role: OpenAI.mapMessageType(message.role),
        content: message.content,
      })),
    };

    if (this.callbackManager?.onLLMStream) {
      const response = await this.session.openai.createChatCompletion(
        {
          ...baseRequestParams,
          stream: true,
        },
        { responseType: "stream" }
      );
      const fullResponse = await aHandleOpenAIStream({
        response,
        onLLMStream: this.callbackManager.onLLMStream,
        parentEvent,
      });
      return { generations: [[{ text: fullResponse }]] };
    }

    const response = await this.session.openai.createChatCompletion(
      baseRequestParams
    );

    const { data } = response;
    const content = data.choices[0].message?.content ?? "";
    return { generations: [[{ text: content }]] };
  }
}
