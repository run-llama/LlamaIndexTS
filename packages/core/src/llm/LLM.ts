import { CallbackManager, Event } from "../callbacks/CallbackManager";
import { handleOpenAIStream } from "../callbacks/utility/handleOpenAIStream";
import { OpenAISession, getOpenAISession } from "./openai";
import OpenAILLM from "openai";
import { ReplicateSession } from "./replicate";

export type MessageType =
  | "user"
  | "assistant"
  | "system"
  | "generic"
  | "function";

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
  "gpt-3.5-turbo": { contextWindow: 4096 },
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
  // Per completion OpenAI params
  model: keyof typeof ALL_AVAILABLE_OPENAI_MODELS;
  temperature: number;
  maxTokens?: number;

  // OpenAI session params
  apiKey?: string = undefined;
  maxRetries: number;
  timeout?: number;
  session: OpenAISession;

  callbackManager?: CallbackManager;

  constructor(init?: Partial<OpenAI>) {
    this.model = init?.model ?? "gpt-3.5-turbo";
    this.temperature = init?.temperature ?? 0;
    this.maxTokens = init?.maxTokens ?? undefined;

    this.apiKey = init?.apiKey ?? undefined;
    this.maxRetries = init?.maxRetries ?? 10;
    this.timeout = init?.timeout ?? undefined; // Default is 60 seconds
    this.session =
      init?.session ??
      getOpenAISession({
        apiKey: this.apiKey,
        maxRetries: this.maxRetries,
        timeout: this.timeout,
      });

    this.callbackManager = init?.callbackManager;
  }

  mapMessageType(
    messageType: MessageType
  ): "user" | "assistant" | "system" | "function" {
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
    const baseRequestParams: OpenAILLM.Chat.CompletionCreateParams = {
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      messages: messages.map((message) => ({
        role: this.mapMessageType(message.role),
        content: message.content,
      })),
    };

    if (this.callbackManager?.onLLMStream) {
      // Streaming
      const response = await this.session.openai.chat.completions.create({
        ...baseRequestParams,
        stream: true,
      });

      const { message, role } = await handleOpenAIStream({
        response,
        onLLMStream: this.callbackManager.onLLMStream,
        parentEvent,
      });
      return { message: { content: message, role } };
    } else {
      // Non-streaming
      const response = await this.session.openai.chat.completions.create(
        baseRequestParams
      );

      const content = response.choices[0].message?.content ?? "";
      return { message: { content, role: response.choices[0].message.role } };
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

export enum DeuceChatStrategy {
  A16Z = "a16z",
  META = "meta",
  METAWBOS = "metawbos",
  //^ This is not exactly right because SentencePiece puts the BOS and EOS token IDs in after tokenization
  // Unfortunately any string only API won't support these properly.
}

/**
 * Llama2 LLM implementation
 */
export class LlamaDeuce implements LLM {
  model: keyof typeof ALL_AVAILABLE_LLAMADEUCE_MODELS;
  chatStrategy: DeuceChatStrategy;
  temperature: number;
  maxTokens?: number;
  replicateSession: ReplicateSession;

  constructor(init?: Partial<LlamaDeuce>) {
    this.model = init?.model ?? "Llama-2-70b-chat";
    this.chatStrategy = init?.chatStrategy ?? DeuceChatStrategy.META;
    this.temperature = init?.temperature ?? 0;
    this.maxTokens = init?.maxTokens ?? undefined;
    this.replicateSession = init?.replicateSession ?? new ReplicateSession();
  }

  mapMessagesToPrompt(messages: ChatMessage[]): string {
    if (this.chatStrategy === DeuceChatStrategy.A16Z) {
      return this.mapMessagesToPromptA16Z(messages);
    } else if (this.chatStrategy === DeuceChatStrategy.META) {
      return this.mapMessagesToPromptMeta(messages);
    } else if (this.chatStrategy === DeuceChatStrategy.METAWBOS) {
      return this.mapMessagesToPromptMeta(messages, true);
    } else {
      return this.mapMessagesToPromptMeta(messages);
    }
  }

  mapMessagesToPromptA16Z(messages: ChatMessage[]): string {
    return (
      messages.reduce((acc, message) => {
        return (
          (acc && `${acc}\n\n`) +
          `${this.mapMessageTypeA16Z(message.role)}${message.content}`
        );
      }, "") + "\n\nAssistant:"
    ); // Here we're differing from A16Z by omitting the space. Generally spaces at the end of prompts decrease performance due to tokenization
  }

  mapMessageTypeA16Z(messageType: MessageType): string {
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

  mapMessagesToPromptMeta(messages: ChatMessage[], withBos = false): string {
    const DEFAULT_SYSTEM_PROMPT = `You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe. Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature.

If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.`;

    const B_SYS = "<<SYS>>\n";
    const E_SYS = "\n<</SYS>>\n\n";
    const B_INST = "[INST]";
    const E_INST = "[/INST]";
    const BOS = "<s>";
    const EOS = "</s>";

    if (messages.length === 0) {
      return "";
    }

    if (messages[0].role === "system") {
      const systemMessage = messages.shift()!;

      const systemStr = `${B_SYS}${systemMessage.content}${E_SYS}`;

      if (messages[1].role !== "user") {
        throw new Error(
          "LlamaDeuce: if there is a system message, the second message must be a user message."
        );
      }

      const userContent = messages[0].content;

      messages[0].content = `${systemStr}${userContent}`;
    } else {
      messages[0].content = `${B_SYS}${DEFAULT_SYSTEM_PROMPT}${E_SYS}${messages[0].content}`;
    }

    return messages.reduce((acc, message, index) => {
      if (index % 2 === 0) {
        return (
          (withBos ? BOS : "") +
          `${acc}${B_INST} ${message.content.trim()} ${E_INST}`
        );
      } else {
        return `${acc} ${message.content.trim()} ` + (withBos ? EOS : ""); // Yes, the EOS comes after the space. This is not a mistake.
      }
    }, "");
  }

  async chat(
    messages: ChatMessage[],
    _parentEvent?: Event
  ): Promise<ChatResponse> {
    const api = ALL_AVAILABLE_LLAMADEUCE_MODELS[this.model]
      .replicateApi as `${string}/${string}:${string}`;

    const prompt = this.mapMessagesToPrompt(messages);

    const response = await this.replicateSession.replicate.run(api, {
      input: {
        prompt,
      },
    });
    return {
      message: {
        content: (response as Array<string>).join(""),
        // We need to do this because Replicate returns a list of strings (for streaming functionality which is not exposed by the run function)
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
