import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand,
  type BedrockRuntimeClientConfig,
  type InvokeModelCommandInput,
  type InvokeModelWithResponseStreamCommandInput,
} from "@aws-sdk/client-bedrock-runtime";

import type {
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  CompletionResponse,
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
  LLMCompletionParamsNonStreaming,
  LLMCompletionParamsStreaming,
  LLMMetadata,
  ToolCallLLMMessageOptions,
} from "llamaindex";
import { ToolCallLLM, streamConverter, wrapLLMEvent } from "llamaindex";
import type {
  AnthropicNoneStreamingResponse,
  AnthropicTextContent,
  StreamEvent,
} from "./types.js";
import {
  mapChatMessagesToAnthropicMessages,
  mapMessageContentToMessageContentDetails,
  toUtf8,
} from "./utils.js";

export type BedrockAdditionalChatOptions = {};

export type BedrockChatParamsStreaming = LLMChatParamsStreaming<
  BedrockAdditionalChatOptions,
  ToolCallLLMMessageOptions
>;

export type BedrockChatStreamResponse = AsyncIterable<
  ChatResponseChunk<ToolCallLLMMessageOptions>
>;

export type BedrockChatParamsNonStreaming = LLMChatParamsNonStreaming<
  BedrockAdditionalChatOptions,
  ToolCallLLMMessageOptions
>;

export type BedrockChatNonStreamResponse =
  ChatResponse<ToolCallLLMMessageOptions>;

export enum BEDROCK_MODELS {
  AMAZON_TITAN_TG1_LARGE = "amazon.titan-tg1-large",
  AMAZON_TITAN_TEXT_EXPRESS_V1 = "amazon.titan-text-express-v1",
  AI21_J2_GRANDE_INSTRUCT = "ai21.j2-grande-instruct",
  AI21_J2_JUMBO_INSTRUCT = "ai21.j2-jumbo-instruct",
  AI21_J2_MID = "ai21.j2-mid",
  AI21_J2_MID_V1 = "ai21.j2-mid-v1",
  AI21_J2_ULTRA = "ai21.j2-ultra",
  AI21_J2_ULTRA_V1 = "ai21.j2-ultra-v1",
  COHERE_COMMAND_TEXT_V14 = "cohere.command-text-v14",
  ANTHROPIC_CLAUDE_INSTANT_1 = "anthropic.claude-instant-v1",
  ANTHROPIC_CLAUDE_1 = "anthropic.claude-v1", // EOF: No longer supported
  ANTHROPIC_CLAUDE_2 = "anthropic.claude-v2",
  ANTHROPIC_CLAUDE_2_1 = "anthropic.claude-v2:1",
  ANTHROPIC_CLAUDE_3_SONNET = "anthropic.claude-3-sonnet-20240229-v1:0",
  ANTHROPIC_CLAUDE_3_HAIKU = "anthropic.claude-3-haiku-20240307-v1:0",
  ANTHROPIC_CLAUDE_3_OPUS = "anthropic.claude-3-opus-20240229-v1:0",
  META_LLAMA2_13B_CHAT = "meta.llama2-13b-chat-v1",
  META_LLAMA2_70B_CHAT = "meta.llama2-70b-chat-v1",
  META_LLAMA3_8B_INSTRUCT = "meta.llama3-8b-instruct-v1:0",
  META_LLAMA3_70B_INSTRUCT = "meta.llama3-70b-instruct-v1:0",
  MISTRAL_7B_INSTRUCT = "mistral.mistral-7b-instruct-v0:2",
  MISTRAL_MIXTRAL_7B_INSTRUCT = "mistral.mixtral-8x7b-instruct-v0:1",
  MISTRAL_MIXTRAL_LARGE_2402 = "mistral.mistral-large-2402-v1:0",
}

/*
 * Values taken from https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters.html#model-parameters-claude
 */

const COMPLETION_MODELS = {
  [BEDROCK_MODELS.AMAZON_TITAN_TG1_LARGE]: 8000,
  [BEDROCK_MODELS.AMAZON_TITAN_TEXT_EXPRESS_V1]: 8000,
  [BEDROCK_MODELS.AI21_J2_GRANDE_INSTRUCT]: 8000,
  [BEDROCK_MODELS.AI21_J2_JUMBO_INSTRUCT]: 8000,
  [BEDROCK_MODELS.AI21_J2_MID]: 8000,
  [BEDROCK_MODELS.AI21_J2_MID_V1]: 8000,
  [BEDROCK_MODELS.AI21_J2_ULTRA]: 8000,
  [BEDROCK_MODELS.AI21_J2_ULTRA_V1]: 8000,
  [BEDROCK_MODELS.COHERE_COMMAND_TEXT_V14]: 4096,
};

const CHAT_ONLY_MODELS = {
  [BEDROCK_MODELS.ANTHROPIC_CLAUDE_INSTANT_1]: 100000,
  [BEDROCK_MODELS.ANTHROPIC_CLAUDE_1]: 100000,
  [BEDROCK_MODELS.ANTHROPIC_CLAUDE_2]: 100000,
  [BEDROCK_MODELS.ANTHROPIC_CLAUDE_2_1]: 200000,
  [BEDROCK_MODELS.ANTHROPIC_CLAUDE_3_SONNET]: 200000,
  [BEDROCK_MODELS.ANTHROPIC_CLAUDE_3_HAIKU]: 200000,
  [BEDROCK_MODELS.ANTHROPIC_CLAUDE_3_OPUS]: 200000,
  [BEDROCK_MODELS.META_LLAMA2_13B_CHAT]: 2048,
  [BEDROCK_MODELS.META_LLAMA2_70B_CHAT]: 4096,
  [BEDROCK_MODELS.META_LLAMA3_8B_INSTRUCT]: 8192,
  [BEDROCK_MODELS.META_LLAMA3_70B_INSTRUCT]: 8192,
  [BEDROCK_MODELS.MISTRAL_7B_INSTRUCT]: 32000,
  [BEDROCK_MODELS.MISTRAL_MIXTRAL_7B_INSTRUCT]: 32000,
  [BEDROCK_MODELS.MISTRAL_MIXTRAL_LARGE_2402]: 32000,
};

const BEDROCK_FOUNDATION_LLMS = { ...COMPLETION_MODELS, ...CHAT_ONLY_MODELS };

/*
 * Only the following models support streaming as
 * per result of Bedrock.Client.list_foundation_models
 * https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/bedrock/client/list_foundation_models.html
 */
export const STREAMING_MODELS = new Set([
  BEDROCK_MODELS.AMAZON_TITAN_TG1_LARGE,
  BEDROCK_MODELS.AMAZON_TITAN_TEXT_EXPRESS_V1,
  BEDROCK_MODELS.ANTHROPIC_CLAUDE_INSTANT_1,
  BEDROCK_MODELS.ANTHROPIC_CLAUDE_1,
  BEDROCK_MODELS.ANTHROPIC_CLAUDE_2,
  BEDROCK_MODELS.ANTHROPIC_CLAUDE_2_1,
  BEDROCK_MODELS.ANTHROPIC_CLAUDE_3_SONNET,
  BEDROCK_MODELS.ANTHROPIC_CLAUDE_3_HAIKU,
  BEDROCK_MODELS.ANTHROPIC_CLAUDE_3_OPUS,
  BEDROCK_MODELS.META_LLAMA2_13B_CHAT,
  BEDROCK_MODELS.META_LLAMA2_70B_CHAT,
  BEDROCK_MODELS.META_LLAMA3_8B_INSTRUCT,
  BEDROCK_MODELS.META_LLAMA3_70B_INSTRUCT,
  BEDROCK_MODELS.MISTRAL_7B_INSTRUCT,
  BEDROCK_MODELS.MISTRAL_MIXTRAL_7B_INSTRUCT,
  BEDROCK_MODELS.MISTRAL_MIXTRAL_LARGE_2402,
]);

abstract class Provider {
  abstract getTextFromResponse(response: Record<string, any>): string;

  getTextFromStreamResponse(response: Record<string, any>): string {
    return this.getTextFromResponse(response);
  }

  abstract getRequestBody<T extends ChatMessage>(
    metadata: LLMMetadata,
    messages: T[],
  ): InvokeModelCommandInput | InvokeModelWithResponseStreamCommandInput;
}

class AnthropicProvider extends Provider {
  getResultFromResponse(
    response: Record<string, any>,
  ): AnthropicNoneStreamingResponse {
    return JSON.parse(toUtf8(response.body));
  }

  getTextFromResponse(response: Record<string, any>): string {
    const result = this.getResultFromResponse(response);
    return result.content
      .filter((item) => item.type === "text")
      .map((item) => (item as AnthropicTextContent).text)
      .join(" ");
  }

  getTextFromStreamResponse(response: Record<string, any>): string {
    const event: StreamEvent | undefined = response.chunk?.bytes
      ? JSON.parse(toUtf8(response.chunk?.bytes))
      : undefined;

    if (event?.type === "content_block_delta") return event.delta.text;
    return "";
  }

  getRequestBody<T extends ChatMessage>(
    metadata: LLMMetadata,
    messages: T[],
  ): InvokeModelCommandInput | InvokeModelWithResponseStreamCommandInput {
    return {
      modelId: metadata.model,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        messages: mapChatMessagesToAnthropicMessages(messages),
        max_tokens: metadata.maxTokens,
        temperature: metadata.temperature,
        top_p: metadata.topP,
      }),
    };
  }
}

// Other providers could go here
const PROVIDERS: { [key: string]: Provider } = {
  anthropic: new AnthropicProvider(),
};

const getProvider = (model: string): Provider => {
  const providerName = model.split(".")[0];
  if (!(providerName in PROVIDERS)) {
    throw new Error(
      `Provider ${providerName} for model ${model} is not supported`,
    );
  }
  return PROVIDERS[providerName];
};

export type BedrockModelParams = {
  model: keyof typeof BEDROCK_FOUNDATION_LLMS;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
};

const DEFAULT_BEDROCK_PARAMS = {
  temperature: 0.1,
  topP: 1,
  maxTokens: 1024, // required by anthropic
};

export type BedrockParams = BedrockModelParams & BedrockRuntimeClientConfig;

/**
 * ToolCallLLM for Bedrock
 */
export class Bedrock extends ToolCallLLM<BedrockAdditionalChatOptions> {
  private client: BedrockRuntimeClient;
  model: keyof typeof BEDROCK_FOUNDATION_LLMS;
  temperature: number;
  topP: number;
  maxTokens?: number;
  provider: Provider;
  topK?: number;

  // there should be no check for env variables. Bedrock can be authenticated in various ways
  // AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY and AWS_REGION are the env variables used directly by the sdk
  constructor({
    temperature,
    topP,
    maxTokens,
    model,
    ...params
  }: BedrockParams) {
    super();

    this.model = model;
    this.provider = getProvider(this.model);
    this.maxTokens = maxTokens ?? DEFAULT_BEDROCK_PARAMS.maxTokens;
    this.temperature = temperature ?? DEFAULT_BEDROCK_PARAMS.temperature;
    this.topP = topP ?? DEFAULT_BEDROCK_PARAMS.topP;
    this.client = new BedrockRuntimeClient(params);
  }

  get supportToolCall(): boolean {
    return false;
  }

  get metadata(): LLMMetadata {
    // NOTE, Anthropic supports top_k but LLMMetadata does not
    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP,
      maxTokens: this.maxTokens,
      contextWindow: BEDROCK_FOUNDATION_LLMS[this.model],
      tokenizer: undefined,
    };
  }

  protected async nonStreamChat(
    params: BedrockChatParamsNonStreaming,
  ): Promise<BedrockChatNonStreamResponse> {
    const input = this.provider.getRequestBody(this.metadata, params.messages);
    const command = new InvokeModelCommand(input);
    const response = await this.client.send(command);
    return {
      raw: response,
      message: {
        content: this.provider.getTextFromResponse(response),
        role: "assistant",
      },
    };
  }

  protected async *streamChat(
    params: BedrockChatParamsStreaming,
  ): BedrockChatStreamResponse {
    if (!STREAMING_MODELS.has(this.model))
      throw new Error(`The model: ${this.model} does not support streaming`);
    const input = this.provider.getRequestBody(this.metadata, params.messages);
    const command = new InvokeModelWithResponseStreamCommand(input);
    const response = await this.client.send(command);

    if (response.body)
      yield* streamConverter(response.body, (response) => {
        return {
          delta: this.provider.getTextFromStreamResponse(response),
          raw: response,
        };
      });
  }

  chat(params: BedrockChatParamsStreaming): Promise<BedrockChatStreamResponse>;
  chat(
    params: BedrockChatParamsNonStreaming,
  ): Promise<BedrockChatNonStreamResponse>;

  @wrapLLMEvent
  async chat(
    params: BedrockChatParamsStreaming | BedrockChatParamsNonStreaming,
  ): Promise<BedrockChatStreamResponse | BedrockChatNonStreamResponse> {
    if (params.stream) return this.streamChat(params);
    return this.nonStreamChat(params);
  }

  complete(
    params: LLMCompletionParamsStreaming,
  ): Promise<AsyncIterable<CompletionResponse>>;
  complete(
    params: LLMCompletionParamsNonStreaming,
  ): Promise<CompletionResponse>;
  async complete(
    params: LLMCompletionParamsStreaming | LLMCompletionParamsNonStreaming,
  ): Promise<CompletionResponse | AsyncIterable<CompletionResponse>> {
    const message: ChatMessage = {
      role: "user",
      content: mapMessageContentToMessageContentDetails(params.prompt),
    };

    const input = this.provider.getRequestBody(this.metadata, [message]);

    if (params.stream) {
      const command = new InvokeModelWithResponseStreamCommand(input);
      const response = await this.client.send(command);
      if (response.body)
        return streamConverter(response.body, (response) => {
          return {
            text: this.provider.getTextFromStreamResponse(response),
            raw: response,
          };
        });
    }

    const command = new InvokeModelCommand(input);
    const response = await this.client.send(command);
    return {
      text: this.provider.getTextFromResponse(response),
      raw: response,
    };
  }
}
