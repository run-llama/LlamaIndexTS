import { getEnv } from "@llamaindex/env";
import Replicate from "../internal/deps/replicate.js";
import { BaseLLM } from "./base.js";
import type {
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
  MessageType,
} from "./types.js";
import {
  extractText,
  streamCallbacks,
  streamConverter,
  wrapLLMEvent,
} from "./utils.js";

export class ReplicateSession {
  replicateKey: string | null = null;
  replicate: Replicate;

  constructor(replicateKey: string | null = null) {
    if (replicateKey) {
      this.replicateKey = replicateKey;
    } else if (getEnv("REPLICATE_API_TOKEN")) {
      this.replicateKey = getEnv("REPLICATE_API_TOKEN") as string;
    } else {
      throw new Error(
        "Set Replicate token in REPLICATE_API_TOKEN env variable",
      );
    }

    this.replicate = new Replicate({ auth: this.replicateKey });
  }
}

export const ALL_AVAILABLE_REPLICATE_MODELS = {
  // TODO: add more models from replicate
  "Llama-2-70b-chat-old": {
    contextWindow: 4096,
    replicateApi:
      "replicate/llama70b-v2-chat:e951f18578850b652510200860fc4ea62b3b16fac280f83ff32282f87bbd2e48",
    //^ Previous 70b model. This is also actually 4 bit, although not exllama.
  },
  "Llama-2-70b-chat-4bit": {
    contextWindow: 4096,
    replicateApi:
      "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
    //^ Model is based off of exllama 4bit.
  },
  "Llama-2-13b-chat-old": {
    contextWindow: 4096,
    replicateApi:
      "a16z-infra/llama13b-v2-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
  },
  //^ Last known good 13b non-quantized model. In future versions they add the SYS and INST tags themselves
  "Llama-2-13b-chat-4bit": {
    contextWindow: 4096,
    replicateApi:
      "meta/llama-2-13b-chat:f4e2de70d66816a838a89eeeb621910adffb0dd0baba3976c96980970978018d",
  },
  "Llama-2-7b-chat-old": {
    contextWindow: 4096,
    replicateApi:
      "a16z-infra/llama7b-v2-chat:4f0a4744c7295c024a1de15e1a63c880d3da035fa1f49bfd344fe076074c8eea",
    //^ Last (somewhat) known good 7b non-quantized model. In future versions they add the SYS and INST
    // tags themselves
    // https://github.com/replicate/cog-llama-template/commit/fa5ce83912cf82fc2b9c01a4e9dc9bff6f2ef137
    // Problem is that they fix the max_new_tokens issue in the same commit. :-(
  },
  "Llama-2-7b-chat-4bit": {
    contextWindow: 4096,
    replicateApi:
      "meta/llama-2-7b-chat:13c3cdee13ee059ab779f0291d29054dab00a47dad8261375654de5540165fb0",
  },

  "llama-3-70b-instruct": {
    contextWindow: 8192,
    replicateApi: "meta/meta-llama-3-70b-instruct",
  },

  "llama-3-8b-instruct": {
    contextWindow: 8192,
    replicateApi: "meta/meta-llama-3-8b-instruct",
  },
};

export enum ReplicateChatStrategy {
  A16Z = "a16z",
  META = "meta",
  METAWBOS = "metawbos",
  //^ This is not exactly right because SentencePiece puts the BOS and EOS token IDs in after tokenization
  // Unfortunately any string only API won't support these properly.
  REPLICATE4BIT = "replicate4bit",
  //^ To satisfy Replicate's 4 bit models' requirements where they also insert some INST tags
  REPLICATE4BITWNEWLINES = "replicate4bitwnewlines",
  //^ Replicate's documentation recommends using newlines: https://replicate.com/blog/how-to-prompt-llama
  LLAMA3 = "llama3",
}

export const DeuceChatStrategy = ReplicateChatStrategy;

/**
 * Replicate LLM implementation used
 */
export class ReplicateLLM extends BaseLLM {
  model: keyof typeof ALL_AVAILABLE_REPLICATE_MODELS;
  chatStrategy: ReplicateChatStrategy;
  temperature: number;
  topP: number;
  maxTokens?: number;
  replicateSession: ReplicateSession;

  constructor(init?: Partial<ReplicateLLM> & { noWarn?: boolean }) {
    super();

    if (!init?.model && !init?.noWarn) {
      console.warn(
        "The default model has been changed to llama-3-70b-instruct. Set noWarn to true to suppress this warning.",
      );
    }

    this.model = init?.model ?? "llama-3-70b-instruct";
    this.chatStrategy =
      init?.chatStrategy ??
      (this.model.startsWith("llama-3")
        ? ReplicateChatStrategy.LLAMA3
        : this.model.endsWith("4bit")
          ? ReplicateChatStrategy.REPLICATE4BITWNEWLINES // With the newer Replicate models they do the system message themselves.
          : ReplicateChatStrategy.METAWBOS); // With BOS and EOS seems to work best, although they all have problems past a certain point
    this.temperature = init?.temperature ?? 0.1; // minimum temperature is 0.01 for Replicate endpoint
    this.topP = init?.topP ?? (this.model.startsWith("llama-3") ? 0.9 : 1); // llama-3 defaults to 0.9 top P
    this.maxTokens =
      init?.maxTokens ??
      ALL_AVAILABLE_REPLICATE_MODELS[this.model].contextWindow; // For Replicate, the default is 500 tokens which is too low.
    this.replicateSession = init?.replicateSession ?? new ReplicateSession();
  }

  get metadata() {
    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP,
      maxTokens: this.maxTokens,
      contextWindow: ALL_AVAILABLE_REPLICATE_MODELS[this.model].contextWindow,
      tokenizer: undefined,
    };
  }

  mapMessagesToPrompt(messages: ChatMessage[]) {
    if (this.chatStrategy === ReplicateChatStrategy.LLAMA3) {
      return this.mapMessagesToPromptLlama3(messages);
    } else if (this.chatStrategy === ReplicateChatStrategy.A16Z) {
      return this.mapMessagesToPromptA16Z(messages);
    } else if (this.chatStrategy === ReplicateChatStrategy.META) {
      return this.mapMessagesToPromptMeta(messages);
    } else if (this.chatStrategy === ReplicateChatStrategy.METAWBOS) {
      return this.mapMessagesToPromptMeta(messages, { withBos: true });
    } else if (this.chatStrategy === ReplicateChatStrategy.REPLICATE4BIT) {
      return this.mapMessagesToPromptMeta(messages, {
        replicate4Bit: true,
        withNewlines: true,
      });
    } else if (
      this.chatStrategy === ReplicateChatStrategy.REPLICATE4BITWNEWLINES
    ) {
      return this.mapMessagesToPromptMeta(messages, {
        replicate4Bit: true,
        withNewlines: true,
      });
    } else {
      return this.mapMessagesToPromptMeta(messages);
    }
  }

  mapMessagesToPromptLlama3(messages: ChatMessage[]) {
    return {
      prompt:
        "<|begin_of_text|>" +
        messages.reduce((acc, message) => {
          let content = "";
          if (typeof message.content === "string") {
            content = message.content;
          } else {
            if (message.content[0].type === "text") {
              content = message.content[0].text;
            } else {
              content = "";
            }
          }

          return (
            acc +
            `<|start_header_id|>${message.role}<|end_header_id|>\n\n${content}<|eot_id|>`
          );
        }, "") +
        "<|start_header_id|>assistant<|end_header_id|>\n\n",
      systemPrompt: undefined,
    };
  }

  mapMessagesToPromptA16Z(messages: ChatMessage[]) {
    return {
      prompt:
        messages.reduce((acc, message) => {
          return (
            (acc && `${acc}\n\n`) +
            `${this.mapMessageTypeA16Z(message.role)}${message.content}`
          );
        }, "") + "\n\nAssistant:",
      //^ Here we're differing from A16Z by omitting the space. Generally spaces at the end of prompts decrease performance due to tokenization
      systemPrompt: undefined,
    };
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
        throw new Error("Unsupported ReplicateLLM message type");
    }
  }

  mapMessagesToPromptMeta(
    messages: ChatMessage[],
    opts?: {
      withBos?: boolean;
      replicate4Bit?: boolean;
      withNewlines?: boolean;
    },
  ) {
    const {
      withBos = false,
      replicate4Bit = false,
      withNewlines = false,
    } = opts ?? {};
    const DEFAULT_SYSTEM_PROMPT = `You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe. Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature.

If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.`;

    const B_SYS = "<<SYS>>\n";
    const E_SYS = "\n<</SYS>>\n\n";
    const B_INST = "[INST]";
    const E_INST = "[/INST]";
    const BOS = "<s>";
    const EOS = "</s>";

    if (messages.length === 0) {
      return { prompt: "", systemPrompt: undefined };
    }

    messages = [...messages]; // so we can use shift without mutating the original array

    let systemPrompt = undefined;
    if (messages[0].role === "system") {
      const systemMessage = messages.shift()!;

      if (replicate4Bit) {
        systemPrompt = systemMessage.content;
      } else {
        const systemStr = `${B_SYS}${systemMessage.content}${E_SYS}`;

        // TS Bug: https://github.com/microsoft/TypeScript/issues/9998
        // @ts-ignore
        if (messages[0].role !== "user") {
          throw new Error(
            "ReplicateLLM: if there is a system message, the second message must be a user message.",
          );
        }

        const userContent = messages[0].content;

        messages[0].content = `${systemStr}${userContent}`;
      }
    } else {
      if (!replicate4Bit) {
        messages[0].content = `${B_SYS}${DEFAULT_SYSTEM_PROMPT}${E_SYS}${messages[0].content}`;
      }
    }

    return {
      prompt: messages.reduce((acc, message, index) => {
        const content = extractText(message.content);
        if (index % 2 === 0) {
          return (
            `${acc}${withBos ? BOS : ""}${B_INST} ${content.trim()} ${E_INST}` +
            (withNewlines ? "\n" : "")
          );
        } else {
          return (
            `${acc} ${content.trim()}` +
            (withNewlines ? "\n" : " ") +
            (withBos ? EOS : "")
          ); // Yes, the EOS comes after the space. This is not a mistake.
        }
      }, ""),
      systemPrompt,
    };
  }

  chat(
    params: LLMChatParamsStreaming,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  chat(params: LLMChatParamsNonStreaming): Promise<ChatResponse>;
  @wrapLLMEvent
  async chat(
    params: LLMChatParamsNonStreaming | LLMChatParamsStreaming,
  ): Promise<ChatResponse | AsyncIterable<ChatResponseChunk>> {
    const { messages, stream } = params;
    const api = ALL_AVAILABLE_REPLICATE_MODELS[this.model]
      .replicateApi as `${string}/${string}:${string}`;

    const { prompt, systemPrompt } = this.mapMessagesToPrompt(messages);

    const replicateOptions: any = {
      input: {
        prompt,
        system_prompt: systemPrompt,
        temperature: this.temperature,
        top_p: this.topP,
      },
    };

    if (this.model.endsWith("4bit")) {
      replicateOptions.input.max_new_tokens = this.maxTokens;
    } else {
      replicateOptions.input.max_length = this.maxTokens;
    }

    if (this.model.startsWith("llama-3")) {
      replicateOptions.input.prompt_template = "{prompt}";
    }

    if (stream) {
      const controller = new AbortController();
      const stream = this.replicateSession.replicate.stream(api, {
        ...replicateOptions,
        signal: controller.signal,
      });
      // replicate.stream is not closing if used as AsyncIterable, force closing after consumption with the AbortController
      return streamCallbacks(
        streamConverter(stream, (chunk) => {
          if (chunk.event === "done") {
            return null;
          }
          return {
            raw: chunk,
            delta: chunk.data,
          };
        }),
        { finished: () => controller.abort() },
      );
    }

    //Non-streaming
    const response = await this.replicateSession.replicate.run(
      api,
      replicateOptions,
    );

    return {
      raw: response,
      message: {
        content: (response as Array<string>).join("").trimStart(),
        //^ We need to do this because Replicate returns a list of strings (for streaming functionality which is not exposed by the run function)
        role: "assistant",
      },
    };
  }
}

export const LlamaDeuce = ReplicateLLM;
