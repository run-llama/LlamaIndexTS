import _ from "lodash";
import OpenAILLM, { ClientOptions as OpenAIClientOptions } from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { Tokenizers, globalsHelper } from "../GlobalsHelper";
import {
  CallbackManager,
  Event,
  EventType,
  OpenAIStreamToken,
  StreamCallbackResponse,
} from "../callbacks/CallbackManager";
import {
  ALL_AVAILABLE_OPENAI_MODELS,
  BaseLLM,
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
  MessageType,
} from "./LLM";
import {
  AzureOpenAIConfig,
  getAzureBaseUrl,
  getAzureConfigFromEnv,
  getAzureModel,
  shouldUseAzure,
} from "./azure";

export class AzureOpenAI extends OpenAILLM {
  protected override authHeaders() {
    return { "api-key": this.apiKey };
  }
}

export class OpenAISession {
  openai: OpenAILLM;

  constructor(options: OpenAIClientOptions & { azure?: boolean } = {}) {
    if (!options.apiKey) {
      if (typeof process !== undefined) {
        options.apiKey = process.env.OPENAI_API_KEY;
      }
    }

    if (!options.apiKey) {
      throw new Error("Set OpenAI Key in OPENAI_API_KEY env variable"); // Overriding OpenAI package's error message
    }

    if (options.azure) {
      this.openai = new AzureOpenAI(options);
    } else {
      this.openai = new OpenAILLM({
        ...options,
        // defaultHeaders: { "OpenAI-Beta": "assistants=v1" },
      });
    }
  }
}

// I'm not 100% sure this is necessary vs. just starting a new session
// every time we make a call. They say they try to reuse connections
// so in theory this is more efficient, but we should test it in the future.
let defaultOpenAISession: {
  session: OpenAISession;
  options: OpenAIClientOptions;
}[] = [];

/**
 * Get a session for the OpenAI API. If one already exists with the same options,
 * it will be returned. Otherwise, a new session will be created.
 * @param options
 * @returns
 */
export function getOpenAISession(
  options: OpenAIClientOptions & { azure?: boolean } = {},
) {
  let session = defaultOpenAISession.find((session) => {
    return _.isEqual(session.options, options);
  })?.session;

  if (!session) {
    session = new OpenAISession(options);
    defaultOpenAISession.push({ session, options });
  }

  return session;
}

/**
 * OpenAI LLM implementation
 */
export class OpenAI extends BaseLLM {
  // Per completion OpenAI params
  model: keyof typeof ALL_AVAILABLE_OPENAI_MODELS | string;
  temperature: number;
  topP: number;
  maxTokens?: number;
  additionalChatOptions?: Omit<
    Partial<OpenAILLM.Chat.ChatCompletionCreateParams>,
    "max_tokens" | "messages" | "model" | "temperature" | "top_p" | "stream"
  >;

  // OpenAI session params
  apiKey?: string = undefined;
  maxRetries: number;
  timeout?: number;
  session: OpenAISession;
  additionalSessionOptions?: Omit<
    Partial<OpenAIClientOptions>,
    "apiKey" | "maxRetries" | "timeout"
  >;

  callbackManager?: CallbackManager;

  constructor(
    init?: Partial<OpenAI> & {
      azure?: AzureOpenAIConfig;
    },
  ) {
    super();
    this.model = init?.model ?? "gpt-3.5-turbo";
    this.temperature = init?.temperature ?? 0.1;
    this.topP = init?.topP ?? 1;
    this.maxTokens = init?.maxTokens ?? undefined;

    this.maxRetries = init?.maxRetries ?? 10;
    this.timeout = init?.timeout ?? 60 * 1000; // Default is 60 seconds
    this.additionalChatOptions = init?.additionalChatOptions;
    this.additionalSessionOptions = init?.additionalSessionOptions;

    if (init?.azure || shouldUseAzure()) {
      const azureConfig = getAzureConfigFromEnv({
        ...init?.azure,
        model: getAzureModel(this.model),
      });

      if (!azureConfig.apiKey) {
        throw new Error(
          "Azure API key is required for OpenAI Azure models. Please set the AZURE_OPENAI_KEY environment variable.",
        );
      }

      this.apiKey = azureConfig.apiKey;
      this.session =
        init?.session ??
        getOpenAISession({
          azure: true,
          apiKey: this.apiKey,
          baseURL: getAzureBaseUrl(azureConfig),
          maxRetries: this.maxRetries,
          timeout: this.timeout,
          defaultQuery: { "api-version": azureConfig.apiVersion },
          ...this.additionalSessionOptions,
        });
    } else {
      this.apiKey = init?.apiKey ?? undefined;
      this.session =
        init?.session ??
        getOpenAISession({
          apiKey: this.apiKey,
          maxRetries: this.maxRetries,
          timeout: this.timeout,
          ...this.additionalSessionOptions,
        });
    }

    this.callbackManager = init?.callbackManager;
  }

  get metadata() {
    const contextWindow =
      ALL_AVAILABLE_OPENAI_MODELS[
        this.model as keyof typeof ALL_AVAILABLE_OPENAI_MODELS
      ]?.contextWindow ?? 1024;
    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP,
      maxTokens: this.maxTokens,
      contextWindow,
      tokenizer: Tokenizers.CL100K_BASE,
    };
  }

  tokens(messages: ChatMessage[]): number {
    // for latest OpenAI models, see https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb
    const tokenizer = globalsHelper.tokenizer(this.metadata.tokenizer);
    const tokensPerMessage = 3;
    let numTokens = 0;
    for (const message of messages) {
      numTokens += tokensPerMessage;
      for (const value of Object.values(message)) {
        numTokens += tokenizer(value).length;
      }
    }
    numTokens += 3; // every reply is primed with <|im_start|>assistant<|im_sep|>
    return numTokens;
  }

  mapMessageType(
    messageType: MessageType,
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

  chat(
    params: LLMChatParamsStreaming,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  chat(params: LLMChatParamsNonStreaming): Promise<ChatResponse>;
  async chat(
    params: LLMChatParamsNonStreaming | LLMChatParamsStreaming,
  ): Promise<ChatResponse | AsyncIterable<ChatResponseChunk>> {
    const { messages, parentEvent, stream } = params;
    const baseRequestParams: OpenAILLM.Chat.ChatCompletionCreateParams = {
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      messages: messages.map(
        (message) =>
          ({
            role: this.mapMessageType(message.role),
            content: message.content,
          }) as ChatCompletionMessageParam,
      ),
      top_p: this.topP,
      ...this.additionalChatOptions,
    };
    // Streaming
    if (stream) {
      return this.streamChat(params);
    }
    // Non-streaming
    const response = await this.session.openai.chat.completions.create({
      ...baseRequestParams,
      stream: false,
    });

    const content = response.choices[0].message?.content ?? "";
    return {
      message: { content, role: response.choices[0].message.role },
    };
  }

  protected async *streamChat({
    messages,
    parentEvent,
  }: LLMChatParamsStreaming): AsyncIterable<ChatResponseChunk> {
    const baseRequestParams: OpenAILLM.Chat.ChatCompletionCreateParams = {
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      messages: messages.map(
        (message) =>
          ({
            role: this.mapMessageType(message.role),
            content: message.content,
          }) as ChatCompletionMessageParam,
      ),
      top_p: this.topP,
      ...this.additionalChatOptions,
    };

    //Now let's wrap our stream in a callback
    const onLLMStream = this.callbackManager?.onLLMStream
      ? this.callbackManager.onLLMStream
      : () => {};

    const chunk_stream: AsyncIterable<OpenAIStreamToken> =
      await this.session.openai.chat.completions.create({
        ...baseRequestParams,
        stream: true,
      });

    const event: Event = parentEvent
      ? parentEvent
      : {
          id: "unspecified",
          type: "llmPredict" as EventType,
        };

    //Indices
    var idx_counter: number = 0;
    for await (const part of chunk_stream) {
      if (!part.choices.length) continue;

      //Increment
      part.choices[0].index = idx_counter;
      const is_done: boolean =
        part.choices[0].finish_reason === "stop" ? true : false;
      //onLLMStream Callback

      const stream_callback: StreamCallbackResponse = {
        event: event,
        index: idx_counter,
        isDone: is_done,
        token: part,
      };
      onLLMStream(stream_callback);

      idx_counter++;

      yield {
        delta: part.choices[0].delta.content ?? "",
      };
    }
    return;
  }
}
