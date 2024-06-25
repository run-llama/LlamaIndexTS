import { getEnv } from "@llamaindex/env";
import _ from "lodash";
import type { LLMOptions } from "portkey-ai";
import { Portkey as OrigPortKey } from "portkey-ai";
import { type StreamCallbackResponse } from "../callbacks/CallbackManager.js";
import { getCallbackManager } from "../internal/settings/CallbackManager.js";
import { BaseLLM } from "./base.js";
import type {
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
  LLMMetadata,
  MessageType,
} from "./types.js";
import { extractText, wrapLLMEvent } from "./utils.js";

interface PortkeyOptions {
  apiKey?: string;
  baseURL?: string;
  mode?: string;
  llms?: [LLMOptions] | null;
}

export class PortkeySession {
  portkey: OrigPortKey;

  constructor(options: PortkeyOptions = {}) {
    if (!options.apiKey) {
      options.apiKey = getEnv("PORTKEY_API_KEY");
    }

    if (!options.baseURL) {
      options.baseURL = getEnv("PORTKEY_BASE_URL") ?? "https://api.portkey.ai";
    }

    this.portkey = new OrigPortKey({});
    this.portkey.llms = [{}];
    if (!options.apiKey) {
      throw new Error("Set Portkey ApiKey in PORTKEY_API_KEY env variable");
    }

    this.portkey = new OrigPortKey(options);
  }
}

const defaultPortkeySession: {
  session: PortkeySession;
  options: PortkeyOptions;
}[] = [];

/**
 * Get a session for the Portkey API. If one already exists with the same options,
 * it will be returned. Otherwise, a new session will be created.
 * @param options
 * @returns
 */
export function getPortkeySession(options: PortkeyOptions = {}) {
  let session = defaultPortkeySession.find((session) => {
    return _.isEqual(session.options, options);
  })?.session;

  if (!session) {
    session = new PortkeySession(options);
    defaultPortkeySession.push({ session, options });
  }
  return session;
}

export class Portkey extends BaseLLM {
  apiKey?: string = undefined;
  baseURL?: string = undefined;
  mode?: string = undefined;
  llms?: [LLMOptions] | null = undefined;
  session: PortkeySession;

  constructor(init?: Partial<Portkey>) {
    super();
    this.apiKey = init?.apiKey;
    this.baseURL = init?.baseURL;
    this.mode = init?.mode;
    this.llms = init?.llms;
    this.session = getPortkeySession({
      apiKey: this.apiKey,
      baseURL: this.baseURL,
      llms: this.llms,
      mode: this.mode,
    });
  }

  get metadata(): LLMMetadata {
    throw new Error("metadata not implemented for Portkey");
  }

  chat(
    params: LLMChatParamsStreaming,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  chat(params: LLMChatParamsNonStreaming): Promise<ChatResponse>;
  @wrapLLMEvent
  async chat(
    params: LLMChatParamsNonStreaming | LLMChatParamsStreaming,
  ): Promise<ChatResponse | AsyncIterable<ChatResponseChunk>> {
    const { messages, stream, additionalChatOptions } = params;
    if (stream) {
      return this.streamChat(messages, additionalChatOptions);
    } else {
      const bodyParams = additionalChatOptions || {};
      const response = await this.session.portkey.chatCompletions.create({
        messages: messages.map((message) => ({
          content: extractText(message.content),
          role: message.role,
        })),
        ...bodyParams,
      });

      const content = response.choices[0].message?.content ?? "";
      const role = response.choices[0].message?.role || "assistant";
      return { raw: response, message: { content, role: role as MessageType } };
    }
  }

  async *streamChat(
    messages: ChatMessage[],
    params?: Record<string, any>,
  ): AsyncIterable<ChatResponseChunk> {
    const chunkStream = await this.session.portkey.chatCompletions.create({
      messages: messages.map((message) => ({
        content: extractText(message.content),
        role: message.role,
      })),
      ...params,
      stream: true,
    });

    //Indices
    let idx_counter: number = 0;
    for await (const part of chunkStream) {
      //Increment
      part.choices[0].index = idx_counter;
      const is_done: boolean =
        part.choices[0].finish_reason === "stop" ? true : false;
      //onLLMStream Callback

      const stream_callback: StreamCallbackResponse = {
        index: idx_counter,
        isDone: is_done,
        // token: part,
      };
      getCallbackManager().dispatchEvent("stream", stream_callback);

      idx_counter++;

      yield { raw: part, delta: part.choices[0].delta?.content ?? "" };
    }
    return;
  }
}
