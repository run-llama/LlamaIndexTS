import {
  BaseLLM,
  type ChatMessage,
  type ChatResponse,
  type ChatResponseChunk,
  type LLMChatParamsNonStreaming,
  type LLMChatParamsStreaming,
  type LLMMetadata,
  type MessageType,
} from "@llamaindex/core/llms";
import { extractText, wrapLLMEvent } from "@llamaindex/core/utils";
import { getEnv } from "@llamaindex/env";
import _ from "lodash";
import { Portkey as OrigPortKey } from "portkey-ai";

type PortkeyOptions = ConstructorParameters<typeof OrigPortKey>[0];

export class PortkeySession {
  portkey: OrigPortKey;

  constructor(options: PortkeyOptions = {}) {
    if (!options.apiKey) {
      options.apiKey = getEnv("PORTKEY_API_KEY")!;
    }

    if (!options.baseURL) {
      options.baseURL = getEnv("PORTKEY_BASE_URL") ?? "https://api.portkey.ai";
    }

    this.portkey = new OrigPortKey({});
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
  apiKey?: string | undefined = undefined;
  baseURL?: string | undefined = undefined;
  session: PortkeySession;

  constructor(init?: Partial<Portkey> & PortkeyOptions) {
    super();
    const { apiKey, baseURL, ...rest } = init || {};
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.session = getPortkeySession({
      ...rest,
      apiKey: this.apiKey,
      baseURL: this.baseURL,
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

      const content = response.choices[0]!.message?.content ?? "";
      const role = response.choices[0]!.message?.role || "assistant";
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
      part.choices[0]!.index = idx_counter;

      idx_counter++;

      yield { raw: part, delta: part.choices[0]!.delta?.content ?? "" };
    }
    return;
  }
}
