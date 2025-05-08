import {
  ToolCallLLM,
  type BaseTool,
  type ChatMessage,
  type ChatResponse,
  type ChatResponseChunk,
  type LLMChatParamsNonStreaming,
  type LLMChatParamsStreaming,
  type LLMMetadata,
  type MessageContent,
  type MessageType,
  type PartialToolCall,
  type ToolCallLLMMessageOptions,
  type ToolCallOptions,
  type ToolResultOptions,
} from "@llamaindex/core/llms";
import type { StoredValue } from "@llamaindex/core/schema";
import { extractText } from "@llamaindex/core/utils";
import { getEnv, uint8ArrayToBase64 } from "@llamaindex/env";
import {
  OpenAI as OpenAILLM,
  type AzureClientOptions,
  type ClientOptions as OpenAIClientOptions,
} from "openai";

import { wrapEventCaller } from "@llamaindex/core/decorator";
import { Tokenizers } from "@llamaindex/env/tokenizers";
import {
  AzureOpenAIWithUserAgent,
  getAzureConfigFromEnv,
  getAzureModel,
  shouldUseAzure,
} from "./azure";
import {
  ALL_AVAILABLE_OPENAI_MODELS,
  isFunctionCallingModel,
  isReasoningModel,
  isTemperatureSupported,
  type LLMInstance,
  type OpenAIAdditionalMetadata,
  type OpenAIResponsesChatOptions,
  type OpenAIResponsesRole,
  type ResponseMessageContent,
  type ResponsesAdditionalOptions,
  type StreamState,
} from "./utils";

export class OpenAIResponses extends ToolCallLLM<OpenAIResponsesChatOptions> {
  model: string;
  temperature: number;
  topP: number;
  maxOutputTokens?: number | undefined;
  additionalChatOptions?: OpenAIResponsesChatOptions | undefined;
  reasoningEffort?: "low" | "medium" | "high" | undefined;
  apiKey?: string | undefined;
  baseURL?: string | undefined;
  maxRetries: number;
  timeout?: number;
  additionalSessionOptions?:
    | undefined
    | Omit<Partial<OpenAIClientOptions>, "apiKey" | "maxRetries" | "timeout">;
  lazySession: () => Promise<LLMInstance>;
  #session: Promise<LLMInstance> | null = null;

  trackPreviousResponses: boolean;
  store: boolean;
  user: string;
  callMetadata: StoredValue;
  builtInTools: OpenAILLM.Responses.Tool[] | null;
  strict: boolean;
  include: OpenAILLM.Responses.ResponseIncludable[] | null;
  instructions: string;
  previousResponseId: string | null;
  truncation: "auto" | "disabled" | null;

  constructor(
    init?: Omit<Partial<OpenAIResponses>, "session"> & {
      session?: LLMInstance | undefined;
      azure?: AzureClientOptions;
    },
  ) {
    super();
    this.model = init?.model ?? "gpt-4o";
    this.temperature = init?.temperature ?? 0.1;

    this.reasoningEffort = isReasoningModel(this.model)
      ? init?.reasoningEffort
      : undefined;

    this.topP = init?.topP ?? 1;
    this.maxOutputTokens = init?.maxOutputTokens ?? undefined;
    this.maxRetries = init?.maxRetries ?? 10;

    this.timeout = init?.timeout ?? 60 * 1000;

    this.apiKey =
      init?.session?.apiKey ?? init?.apiKey ?? getEnv("OPENAI_API_KEY");
    this.baseURL =
      init?.session?.baseURL ?? init?.baseURL ?? getEnv("OPENAI_BASE_URL");

    this.additionalSessionOptions = init?.additionalSessionOptions;
    this.additionalChatOptions = init?.additionalChatOptions;

    this.trackPreviousResponses = init?.trackPreviousResponses ?? false;
    this.builtInTools = init?.builtInTools ?? null;
    this.store = init?.store ?? false;
    this.user = init?.user ?? "";
    this.callMetadata = init?.callMetadata ?? {};
    this.strict = init?.strict ?? false;
    this.include = init?.include ?? null;
    this.instructions = init?.instructions ?? "";
    this.previousResponseId = init?.previousResponseId ?? null;
    this.truncation = init?.truncation ?? null;

    if (init?.azure || shouldUseAzure()) {
      const azureConfig = {
        ...getAzureConfigFromEnv({
          model: getAzureModel(this.model),
        }),
        ...init?.azure,
      };

      this.lazySession = async () =>
        init?.session ??
        import("openai").then(({ AzureOpenAI }) => {
          AzureOpenAI = AzureOpenAIWithUserAgent(AzureOpenAI);

          return new AzureOpenAI({
            maxRetries: this.maxRetries,
            timeout: this.timeout!,
            ...this.additionalSessionOptions,
            ...azureConfig,
          });
        });
    } else {
      this.lazySession = async () =>
        init?.session ??
        import("openai").then(({ OpenAI }) => {
          return new OpenAI({
            apiKey: this.apiKey,
            baseURL: this.baseURL,
            maxRetries: this.maxRetries,
            timeout: this.timeout!,
            ...this.additionalSessionOptions,
          });
        });
    }
  }

  get session() {
    if (!this.#session) {
      this.#session = this.lazySession();
    }
    return this.#session;
  }

  get supportToolCall() {
    return isFunctionCallingModel(this);
  }

  get metadata(): LLMMetadata & OpenAIAdditionalMetadata {
    const contextWindow =
      ALL_AVAILABLE_OPENAI_MODELS[
        this.model as keyof typeof ALL_AVAILABLE_OPENAI_MODELS
      ]?.contextWindow ?? 1024;

    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP,
      maxTokens: this.maxOutputTokens,
      contextWindow,
      tokenizer: Tokenizers.CL100K_BASE,
      structuredOutput: true,
    };
  }

  private createInitialMessage(): ChatMessage<ToolCallLLMMessageOptions> {
    return {
      role: "assistant",
      content: "",
    };
  }

  private createInitialOptions(): ResponsesAdditionalOptions {
    return {
      built_in_tool_calls: [],
    };
  }

  private isBuiltInToolCall(
    item: OpenAILLM.Responses.ResponseOutputItem,
  ): item is
    | OpenAILLM.Responses.ResponseFileSearchToolCall
    | OpenAILLM.Responses.ResponseComputerToolCall
    | OpenAILLM.Responses.ResponseFunctionWebSearch {
    return ["file_search_call", "computer_call", "web_search_call"].includes(
      item.type,
    );
  }

  private isReasoning(item: OpenAILLM.Responses.ResponseOutputItem) {
    return item.type === "reasoning";
  }

  private isMessageBlock(item: OpenAILLM.Responses.ResponseOutputItem) {
    return item.type === "message";
  }

  private isFunctionCall(item: OpenAILLM.Responses.ResponseOutputItem) {
    return item.type === "function_call";
  }

  private isResponseCreatedEvent(
    event: OpenAILLM.Responses.ResponseStreamEvent,
  ): event is OpenAILLM.Responses.ResponseCreatedEvent {
    return event.type === "response.created";
  }

  private isResponseOutputItemAddedEvent(
    event: OpenAILLM.Responses.ResponseStreamEvent,
  ): event is OpenAILLM.Responses.ResponseOutputItemAddedEvent {
    return event.type === "response.output_item.added";
  }

  private isToolCallEvent(
    event: OpenAILLM.Responses.ResponseOutputItemAddedEvent,
  ): event is OpenAILLM.Responses.ResponseOutputItemAddedEvent & {
    item: OpenAILLM.Responses.ResponseFunctionToolCall;
  } {
    return event.item.type === "function_call";
  }

  private isResponseTextDeltaEvent(
    event: OpenAILLM.Responses.ResponseStreamEvent,
  ): event is OpenAILLM.Responses.ResponseTextDeltaEvent {
    return event.type === "response.output_text.delta";
  }

  private isResponseFunctionCallArgumentsDeltaEvent(
    event: OpenAILLM.Responses.ResponseStreamEvent,
  ): event is OpenAILLM.Responses.ResponseFunctionCallArgumentsDeltaEvent {
    return event.type === "response.function_call_arguments.delta";
  }

  private isResponseFunctionCallDoneEvent(
    event: OpenAILLM.Responses.ResponseStreamEvent,
  ): event is OpenAILLM.Responses.ResponseFunctionCallArgumentsDoneEvent {
    return event.type === "response.function_call_arguments.done";
  }

  private isResponseOutputTextAnnotationAddedEvent(
    event: OpenAILLM.Responses.ResponseStreamEvent,
  ): event is OpenAILLM.Responses.ResponseTextAnnotationDeltaEvent {
    return event.type === "response.output_text.annotation.added";
  }

  private isResponseFileSearchCallCompletedEvent(
    event: OpenAILLM.Responses.ResponseStreamEvent,
  ): event is OpenAILLM.Responses.ResponseFileSearchCallCompletedEvent {
    return event.type === "response.file_search_call.completed";
  }

  private isResponseWebSearchCallCompletedEvent(
    event: OpenAILLM.Responses.ResponseStreamEvent,
  ): event is OpenAILLM.Responses.ResponseWebSearchCallCompletedEvent {
    return event.type === "response.web_search_call.completed";
  }

  private isResponseCompletedEvent(
    event: OpenAILLM.Responses.ResponseStreamEvent,
  ): event is OpenAILLM.Responses.ResponseCompletedEvent {
    return event.type === "response.completed";
  }

  private isTextPresent(
    part:
      | OpenAILLM.Responses.ResponseOutputText
      | OpenAILLM.Responses.ResponseOutputRefusal,
  ) {
    return "text" in part;
  }

  private isRefusalPresent(
    part:
      | OpenAILLM.Responses.ResponseOutputText
      | OpenAILLM.Responses.ResponseOutputRefusal,
  ) {
    return "refusal" in part;
  }

  private isAnnotationPresent(
    part:
      | OpenAILLM.Responses.ResponseOutputText
      | OpenAILLM.Responses.ResponseOutputRefusal,
  ) {
    return "annotations" in part;
  }

  private handleResponseOutputMessage(
    item: OpenAILLM.Responses.ResponseOutputMessage,
    options: ResponsesAdditionalOptions,
  ): string {
    let outputContent = "";
    for (const part of item.content) {
      if (this.isTextPresent(part)) {
        outputContent += part.text;
      }
      if (this.isAnnotationPresent(part)) {
        options.annotations = part.annotations;
      }
      if (this.isRefusalPresent(part)) {
        options.refusal = part.refusal;
      }
    }
    return outputContent;
  }

  private extractToolCalls(
    response: OpenAILLM.Responses.ResponseOutputItem[],
  ): PartialToolCall[] {
    return response
      .filter((item): item is OpenAILLM.Responses.ResponseFunctionToolCall =>
        this.isFunctionCall(item),
      )
      .map((item) => {
        return {
          name: item.name,
          id: item.call_id,
          input: item.arguments,
        };
      });
  }

  private parseResponseOutput(
    response: OpenAILLM.Responses.ResponseOutputItem[],
  ): ChatMessage<ToolCallLLMMessageOptions> {
    const message = this.createInitialMessage();
    const options = this.createInitialOptions();
    const toolCall = this.extractToolCalls(response);

    for (const item of response) {
      if (this.isMessageBlock(item)) {
        const outputContent = this.handleResponseOutputMessage(item, options);
        message.content = outputContent;
      } else if (this.isBuiltInToolCall(item)) {
        options.built_in_tool_calls.push(item);
      } else if (this.isReasoning(item)) {
        options.reasoning = item;
      }
    }
    message.options = {
      ...options,
      toolCall: toolCall,
    };

    return message;
  }

  private processStreamEvent(
    event: OpenAILLM.Responses.ResponseStreamEvent,
    streamState: StreamState,
  ) {
    switch (true) {
      case this.isResponseCreatedEvent(event):
        this.handleResponseCreatedEvent(event, streamState);
        break;
      case this.isResponseOutputItemAddedEvent(event):
        this.handleOutputItemAddedEvent(event, streamState);
        break;
      case this.isResponseTextDeltaEvent(event):
        this.handleTextDeltaEvent(event, streamState);
        break;
      case this.isResponseFunctionCallArgumentsDeltaEvent(event):
        this.handleFunctionCallArgumentsDeltaEvent(event, streamState);
        break;
      case this.isResponseFunctionCallDoneEvent(event):
        this.handleFunctionCallArgumentsDoneEvent(event, streamState);
        break;
      case this.isResponseOutputTextAnnotationAddedEvent(event):
        this.handleOutputTextAnnotationAddedEvent(event, streamState);
        break;
      case this.isResponseFileSearchCallCompletedEvent(event):
      case this.isResponseWebSearchCallCompletedEvent(event):
        this.handleBuiltInToolCallCompletedEvent(event, streamState);
        break;
      case this.isResponseCompletedEvent(event):
        this.handleCompletedEvent(event, streamState);
        break;
    }
  }

  private handleResponseCreatedEvent(
    event: OpenAILLM.Responses.ResponseCreatedEvent,
    streamState: StreamState,
  ) {
    if (this.trackPreviousResponses) {
      streamState.previousResponseId = event.response.id;
    }
  }

  private handleOutputItemAddedEvent(
    event: OpenAILLM.Responses.ResponseOutputItemAddedEvent,
    streamState: StreamState,
  ) {
    if (this.isToolCallEvent(event)) {
      streamState.currentToolCall = {
        name: event.item.name,
        id: event.item.call_id,
        input: event.item.arguments,
      };
    }
  }

  private handleTextDeltaEvent(
    event: OpenAILLM.Responses.ResponseTextDeltaEvent,
    streamState: StreamState,
  ) {
    streamState.delta = event.delta;
  }

  private handleFunctionCallArgumentsDeltaEvent(
    event: OpenAILLM.Responses.ResponseFunctionCallArgumentsDeltaEvent,
    streamState: StreamState,
  ) {
    if (streamState.currentToolCall) {
      streamState.currentToolCall!.input += event.delta;
    }
  }

  private handleFunctionCallArgumentsDoneEvent(
    event: OpenAILLM.Responses.ResponseFunctionCallArgumentsDoneEvent,
    streamState: StreamState,
  ) {
    if (streamState.currentToolCall) {
      streamState.currentToolCall.input = event.arguments;
    }

    streamState.shouldEmitToolCall = {
      ...streamState.currentToolCall!,
      input: JSON.parse(streamState.currentToolCall!.input),
    };
  }

  private handleOutputTextAnnotationAddedEvent(
    event: OpenAILLM.Responses.ResponseTextAnnotationDeltaEvent,
    streamState: StreamState,
  ) {
    if (!streamState.options.annotations) {
      streamState.options.annotations = [];
    }
    streamState.options.annotations.push(event.annotation);
  }

  private handleBuiltInToolCallCompletedEvent(
    event:
      | OpenAILLM.Responses.ResponseFileSearchCallCompletedEvent
      | OpenAILLM.Responses.ResponseWebSearchCallCompletedEvent,
    streamState: StreamState,
  ) {
    streamState.options.built_in_tool_calls.push(event);
  }

  private handleCompletedEvent(
    event: OpenAILLM.Responses.ResponseCompletedEvent,
    streamState: StreamState,
  ) {
    if (event.response.usage) {
      streamState.options.usage = event.response.usage;
    }
  }

  private createBaseRequestParams(
    messages: ChatMessage<ToolCallLLMMessageOptions>[],
    tools: BaseTool[] | undefined,
    additionalChatOptions: OpenAIResponsesChatOptions | undefined,
  ) {
    const baseRequestParams = <OpenAILLM.Responses.ResponseCreateParams>{
      model: this.model,
      include: this.include,
      input: this.toOpenAIResponseMessages(messages),
      tools: this.builtInTools ? [...this.builtInTools] : [],
      instructions: this.instructions,
      max_output_tokens: this.maxOutputTokens,
      previous_response_id: this.previousResponseId,
      store: this.store,
      metadata: this.callMetadata,
      top_p: this.topP,
      truncation: this.truncation,
      user: this.user,
      ...Object.assign({}, this.additionalChatOptions, additionalChatOptions),
    };

    if (tools?.length) {
      if (!baseRequestParams.tools) {
        baseRequestParams.tools = [];
      }
      baseRequestParams.tools.push(
        ...tools.map(this.toResponsesTool.bind(this)),
      );
    }

    return baseRequestParams;
  }

  chat(
    params: LLMChatParamsStreaming<
      OpenAIResponsesChatOptions,
      ToolCallLLMMessageOptions
    >,
  ): Promise<AsyncIterable<ChatResponseChunk<ToolCallLLMMessageOptions>>>;
  chat(
    params: LLMChatParamsNonStreaming<
      OpenAIResponsesChatOptions,
      ToolCallLLMMessageOptions
    >,
  ): Promise<ChatResponse<ToolCallLLMMessageOptions>>;
  async chat(
    params:
      | LLMChatParamsNonStreaming<
          OpenAIResponsesChatOptions,
          ToolCallLLMMessageOptions
        >
      | LLMChatParamsStreaming<
          OpenAIResponsesChatOptions,
          ToolCallLLMMessageOptions
        >,
  ): Promise<
    | ChatResponse<ToolCallLLMMessageOptions>
    | AsyncIterable<ChatResponseChunk<ToolCallLLMMessageOptions>>
  > {
    const { messages, stream, tools, responseFormat, additionalChatOptions } =
      params;
    const baseRequestParams = this.createBaseRequestParams(
      messages,
      tools,
      additionalChatOptions,
    );

    if (
      Array.isArray(baseRequestParams.tools) &&
      baseRequestParams.tools.length === 0
    ) {
      // remove empty tools array to avoid OpenAI error
      delete baseRequestParams.tools;
    }

    if (!isTemperatureSupported(baseRequestParams.model))
      delete baseRequestParams.temperature;

    if (stream) {
      return this.streamChat(baseRequestParams);
    }

    const response = await (
      await this.session
    ).responses.create({
      ...baseRequestParams,
      stream: false,
    });

    const message = this.parseResponseOutput(response.output);
    return {
      raw: response,
      message,
    };
  }

  private initalizeStreamState(): StreamState {
    return {
      delta: "",
      currentToolCall: null,
      shouldEmitToolCall: null,
      options: this.createInitialOptions(),
      previousResponseId: this.previousResponseId,
    };
  }

  private createResponseChunk(
    event: OpenAILLM.Responses.ResponseStreamEvent,
    state: StreamState,
  ): ChatResponseChunk<ToolCallLLMMessageOptions> {
    return {
      raw: event,
      delta: state.delta,
      options: state.shouldEmitToolCall
        ? { toolCall: [state.shouldEmitToolCall] }
        : state.currentToolCall
          ? { toolCall: [state.currentToolCall] }
          : {},
    };
  }

  @wrapEventCaller
  protected async *streamChat(
    baseRequestParams: OpenAILLM.Responses.ResponseCreateParams,
  ): AsyncIterable<ChatResponseChunk<ToolCallLLMMessageOptions>> {
    const streamState = this.initalizeStreamState();

    const stream = await (
      await this.session
    ).responses.create({
      ...baseRequestParams,
      stream: true,
    });

    for await (const event of stream) {
      this.processStreamEvent(event, streamState);
      this.handlePreviousResponseId(streamState);
      yield this.createResponseChunk(event, streamState);
    }
  }

  toOpenAIResponsesRole(messageType: MessageType): OpenAIResponsesRole {
    switch (messageType) {
      case "user":
        return "user";
      case "assistant":
        return "assistant";
      case "system":
        return "system";
      case "developer":
        return "developer";
      default:
        return "user";
    }
  }

  private isToolResultPresent(
    options: ToolCallLLMMessageOptions,
  ): options is ToolResultOptions {
    return "toolResult" in options;
  }

  private isToolCallPresent(
    options: ToolCallLLMMessageOptions,
  ): options is ToolCallOptions {
    return "toolCall" in options;
  }

  private isUserMessage(message: ChatMessage<ToolCallLLMMessageOptions>) {
    return message.role === "user";
  }

  private handlePreviousResponseId(streamState: StreamState) {
    if (this.trackPreviousResponses) {
      if (streamState.previousResponseId != this.previousResponseId) {
        this.previousResponseId = streamState.previousResponseId;
      }
    }
  }

  private convertToOpenAIToolCallResult(
    options: ToolResultOptions,
    content: MessageContent,
  ) {
    return {
      type: "function_call_output",
      call_id: options.toolResult.id,
      output: extractText(content),
    } satisfies OpenAILLM.Responses.ResponseInputItem.FunctionCallOutput;
  }

  private convertToOpenAIToolCalls(options: ToolCallOptions) {
    return options.toolCall.map((toolCall) => {
      return {
        type: "function_call",
        call_id: toolCall.id,
        name: toolCall.name,
        arguments:
          typeof toolCall.input === "string"
            ? toolCall.input
            : JSON.stringify(toolCall.input),
      };
    }) satisfies OpenAILLM.Responses.ResponseFunctionToolCall[];
  }

  private processMessageContent(
    content: MessageContent,
  ): ResponseMessageContent {
    if (!Array.isArray(content)) {
      return content;
    }

    return content.map((item, index) => {
      if (item.type === "text") {
        return {
          type: "input_text",
          text: item.text,
        };
      }
      if (item.type === "image_url") {
        return {
          type: "input_image",
          image_url: item.image_url.url,
          detail: item.detail || "auto",
        };
      }
      if (item.type === "file") {
        if (item.mimeType !== "application/pdf") {
          throw new Error(
            "Only supports mimeType `application/pdf` for file content.",
          );
        }

        const base64Data = uint8ArrayToBase64(item.data);
        return {
          type: "input_file",
          filename: `part-${index}.pdf`,
          file_data: `data:${item.mimeType};base64,${base64Data}`,
        };
      }
      throw new Error("Unsupported content type");
    });
  }

  private convertToOpenAIUserMessage(
    message: ChatMessage<ToolCallLLMMessageOptions>,
  ) {
    const messageContent = this.processMessageContent(message.content);
    return {
      role: "user",
      content: messageContent,
    } satisfies OpenAILLM.Responses.EasyInputMessage;
  }

  private defaultOpenAIResponseMessage(
    message: ChatMessage<ToolCallLLMMessageOptions>,
  ) {
    const response: OpenAILLM.Responses.ResponseInputItem = {
      role: this.toOpenAIResponsesRole(message.role),
      content: extractText(message.content),
    };
    return response;
  }

  toOpenAIResponseMessage(
    message: ChatMessage<ToolCallLLMMessageOptions>,
  ):
    | OpenAILLM.Responses.ResponseInputItem
    | OpenAILLM.Responses.ResponseInputItem[] {
    const options = message.options ?? {};

    if (this.isToolResultPresent(options)) {
      return this.convertToOpenAIToolCallResult(options, message.content);
    } else if (this.isToolCallPresent(options)) {
      return this.convertToOpenAIToolCalls(options);
    } else if (this.isUserMessage(message)) {
      return this.convertToOpenAIUserMessage(message);
    }

    return this.defaultOpenAIResponseMessage(message);
  }

  toOpenAIResponseMessages(
    messages: ChatMessage<ToolCallLLMMessageOptions>[],
  ): OpenAILLM.Responses.ResponseInput {
    const finalMessages: OpenAILLM.Responses.ResponseInputItem[] = [];
    for (const message of messages) {
      const processedMessage = this.toOpenAIResponseMessage(message);
      if (Array.isArray(processedMessage)) {
        finalMessages.push(...processedMessage);
      } else {
        finalMessages.push(processedMessage);
      }
    }
    return finalMessages;
  }

  toResponsesTool(tool: BaseTool): OpenAILLM.Responses.Tool {
    return {
      type: "function",
      name: tool.metadata.name,
      description: tool.metadata.description,
      parameters: tool.metadata.parameters ?? {},
      strict: this.strict,
    };
  }
}

/**
 * Convenience function to create a new OpenAI instance.
 * @param init - Optional initialization parameters for the OpenAI instance.
 * @returns A new OpenAI instance.
 */
export const openaiResponses = (
  init?: ConstructorParameters<typeof OpenAIResponses>[0],
) => new OpenAIResponses(init);
