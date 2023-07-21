import { CallbackManager, Event } from "../callbacks/CallbackManager";
import { handleOpenAIStream } from "../callbacks/utility/handleOpenAIStream";
import {
  ChatCompletionRequestMessageRoleEnum,
  CreateChatCompletionRequest,
  OpenAISession,
  getOpenAISession,
} from "./openai";
import { ReplicateSession } from "./replicate";

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
  chat(messages: ChatMessage[], parentEvent?: Event): Promise<ChatResponse>;

  /**
   * Get a prompt completion from the LLM
   * @param prompt the prompt to complete
   */
  complete(prompt: string, parentEvent?: Event): Promise<CompletionResponse>;
}

export const GPT4_MODELS = {
  "gpt-4": { contextWindow: 8192 },
  "gpt-4-32k": { contextWindow: 32768 },
};

export const TURBO_MODELS = {
  "gpt-3.5-turbo": { contextWindow: 4097 },
  "gpt-3.5-turbo-16k": { contextWindow: 16384 },
};

/**
 * We currently support GPT-3.5 and GPT-4 models
 */
export const ALL_AVAILABLE_OPENAI_MODELS = {
  ...GPT4_MODELS,
  ...TURBO_MODELS,
};

/**
 * OpenAI LLM implementation
 */
export class OpenAI implements LLM {
  model: keyof typeof ALL_AVAILABLE_OPENAI_MODELS;
  temperature: number;
  n: number = 1;
  maxTokens?: number;
  session: OpenAISession;
  maxRetries: number;
  requestTimeout: number | null;
  callbackManager?: CallbackManager;

  constructor(init?: Partial<OpenAI>) {
    this.model = init?.model ?? "gpt-3.5-turbo";
    this.temperature = init?.temperature ?? 0;
    this.requestTimeout = init?.requestTimeout ?? null;
    this.maxRetries = init?.maxRetries ?? 10;
    this.maxTokens = init?.maxTokens ?? undefined;
    this.session = init?.session ?? getOpenAISession();
    this.callbackManager = init?.callbackManager;
  }

  mapMessageType(
    messageType: MessageType
  ): ChatCompletionRequestMessageRoleEnum {
    switch (messageType) {
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

  async chat(
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

      const fullResponse = await handleOpenAIStream({
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

  async complete(
    prompt: string,
    parentEvent?: Event
  ): Promise<CompletionResponse> {
    return this.chat([{ content: prompt, role: "user" }], parentEvent);
  }
}

export const ALL_AVAILABLE_LLAMADEUCE_MODELS = {
  "Llama-2-70b-chat": {
    contextWindow: 4096,
    replicateApi:
      "replicate/llama70b-v2-chat:e951f18578850b652510200860fc4ea62b3b16fac280f83ff32282f87bbd2e48",
  },
  "Llama-2-13b-chat": {
    contextWindow: 4096,
    replicateApi:
      "a16z-infra/llama13b-v2-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
  },
  "Llama-2-7b-chat": {
    contextWindow: 4096,
    replicateApi:
      "a16z-infra/llama7b-v2-chat:4f0a4744c7295c024a1de15e1a63c880d3da035fa1f49bfd344fe076074c8eea",
  },
};

/**
 * Llama2 LLM implementation
 */
export class LlamaDeuce implements LLM {
  model: keyof typeof ALL_AVAILABLE_LLAMADEUCE_MODELS;
  temperature: number;
  maxTokens?: number;
  replicateSession: ReplicateSession;

  constructor(init?: Partial<LlamaDeuce>) {
    this.model = init?.model ?? "Llama-2-70b-chat";
    this.temperature = init?.temperature ?? 0;
    this.maxTokens = init?.maxTokens ?? undefined;
    this.replicateSession = init?.replicateSession ?? new ReplicateSession();
  }

  mapMessageType(messageType: MessageType): string {
    switch (messageType) {
      case "user":
        return "User: ";
      case "assistant":
        return "Assistant: ";
      case "system":
        return "";
      default:
        throw new Error("Unsupported LlamaDeuce message type");
    }
  }

  async chat(
    messages: ChatMessage[],
    _parentEvent?: Event
  ): Promise<ChatResponse> {
    const api = ALL_AVAILABLE_LLAMADEUCE_MODELS[this.model]
      .replicateApi as `${string}/${string}:${string}`;
    const response = await this.replicateSession.replicate.run(api, {
      input: {
        prompt:
          messages.reduce((acc, message) => {
            return (
              (acc && `${acc}\n\n`) +
              `${this.mapMessageType(message.role)}${message.content}`
            );
          }, "") + "\n\nAssistant:", // Here we're differing from A16Z by omitting the space. Generally spaces at the end of prompts decrease performance due to tokenization
      },
    });
    return {
      message: {
        content: (response as Array<string>).join(""), // We need to do this because replicate returns a list of strings (for streaming functionality)
        role: "assistant",
      },
    };
  }

  async complete(
    prompt: string,
    parentEvent?: Event
  ): Promise<CompletionResponse> {
    return this.chat([{ content: prompt, role: "user" }], parentEvent);
  }
}
