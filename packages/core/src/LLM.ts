import { Key } from "readline";
import { CallbackManager, Event } from "./callbacks/CallbackManager";
import { aHandleOpenAIStream } from "./callbacks/utility/aHandleOpenAIStream";
import {
  ChatCompletionRequestMessageRoleEnum,
  CreateChatCompletionRequest,
  OpenAISession,
  getOpenAISession,
} from "./openai";

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

/**
 * Unified language model interface
 */
export interface LLM {
  /**
   * Get a chat response from the LLM
   * @param messages
   */
  achat(messages: ChatMessage[]): Promise<ChatResponse>;

  /**
   * Get a prompt completion from the LLM
   * @param prompt the prompt to complete
   */
  acomplete(prompt: string): Promise<CompletionResponse>;
}

export const GPT4_MODELS = {
  "gpt-4": 8192,
  "gpt-4-32k": 32768,
};

export const TURBO_MODELS = {
  "gpt-3.5-turbo": 4096,
  "gpt-3.5-turbo-16k": 16384,
};

/**
 * We currently support GPT-3.5 and GPT-4 models
 */
export const ALL_AVAILABLE_MODELS = {
  ...GPT4_MODELS,
  ...TURBO_MODELS,
};

/**
 * OpenAI LLM implementation
 */
export class OpenAI implements LLM {
  model: keyof typeof ALL_AVAILABLE_MODELS;
  temperature: number;
  requestTimeout: number | null;
  maxRetries: number;
  n: number = 1;
  maxTokens?: number;
  openAIKey: string | null = null;
  session: OpenAISession;
  callbackManager?: CallbackManager;

  constructor(init?: Partial<OpenAI>) {
    this.model = init?.model ?? "gpt-3.5-turbo";
    this.temperature = init?.temperature ?? 0;
    this.requestTimeout = init?.requestTimeout ?? null;
    this.maxRetries = init?.maxRetries ?? 10;
    this.maxTokens =
      init?.maxTokens ?? Math.floor(ALL_AVAILABLE_MODELS[this.model] / 2);
    this.openAIKey = init?.openAIKey ?? null;
    this.session = init?.session ?? getOpenAISession();
    this.callbackManager = init?.callbackManager;
  }

  mapMessageType(type: MessageType): ChatCompletionRequestMessageRoleEnum {
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

  async achat(
    messages: ChatMessage[],
    parentEvent?: Event
  ): Promise<ChatResponse> {
    const baseRequestParams: CreateChatCompletionRequest = {
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      n: this.n,
      messages: messages.map((message) => ({
        role: this.mapMessageType(message.role),
        content: message.content,
      })),
    };

    if (this.callbackManager?.onLLMStream) {
      // Streaming
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
      return { message: { content: fullResponse, role: "assistant" } };
    } else {
      // Non-streaming
      const response = await this.session.openai.createChatCompletion(
        baseRequestParams
      );

      const content = response.data.choices[0].message?.content ?? "";
      return { message: { content, role: "assistant" } };
    }
  }

  async acomplete(
    prompt: string,
    parentEvent?: Event
  ): Promise<CompletionResponse> {
    return this.achat([{ content: prompt, role: "user" }], parentEvent);
  }
}
