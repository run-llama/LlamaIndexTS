import {
  ToolCallLLM,
  type BaseTool,
  type ChatResponse,
  type ChatResponseChunk,
  type LLMChatParamsNonStreaming,
  type LLMChatParamsStreaming,
  type LLMMetadata,
  type MessageType,
  type PartialToolCall,
  type ResponsesChatMessage,
  type ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import type { StoredValue } from "@llamaindex/core/schema";
import { extractText } from "@llamaindex/core/utils";
import { getEnv } from "@llamaindex/env";
import {
  AzureOpenAI as AzureOpenAILLM,
  OpenAI as OpenAILLM,
  type AzureClientOptions,
  type ClientOptions as OpenAIClientOptions,
} from "openai";

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
  type OpenAIAdditionalMetadata,
} from "./utils";

export type OpenAIResponsesChatOptions = Omit<
  Partial<OpenAILLM.Responses.ResponseCreateParams>,
  | "model"
  | "input"
  | "stream"
  | "tools"
  | "toolChoice"
  | "temperature"
  | "reasoning_effort"
  | "top_p"
  | "max_output_tokens"
  | "include"
>;

type ResponsesAdditionalOptions = {
  built_in_tool_calls: Array<
    | OpenAILLM.Responses.ResponseFileSearchToolCall
    | OpenAILLM.Responses.ResponseComputerToolCall
    | OpenAILLM.Responses.ResponseFunctionWebSearch
  >;
  annotations?: Array<
    | OpenAILLM.Responses.ResponseOutputText.FileCitation
    | OpenAILLM.Responses.ResponseOutputText.URLCitation
    | OpenAILLM.Responses.ResponseOutputText.FilePath
  >;
  refusal?: string;
  reasoning?: OpenAILLM.Responses.ResponseReasoningItem;
};

type LLMInstance = Pick<
  AzureOpenAILLM | OpenAILLM,
  "chat" | "apiKey" | "baseURL" | "responses"
>;

export type OpenAIResponsesRole = "user" | "assistant" | "system" | "developer";

export class OpenAIResponse extends ToolCallLLM<OpenAIResponsesChatOptions> {
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

  get session() {
    if (!this.#session) {
      this.#session = this.lazySession();
    }
    return this.#session;
  }

  trackPreviousResponses: boolean;
  store: boolean;
  user: string;
  callMetadata: StoredValue;
  builtInTools: OpenAILLM.Responses.Tool[] | null;
  strict: boolean;
  include: string[];
  instructions: string;
  previousResponseIds: string;
  truncation: string;

  constructor(
    init?: Omit<Partial<OpenAIResponse>, "session"> & {
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

    this.timeout = init?.timeout ?? 60 * 1000; // Default is 60 seconds

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
    this.include = init?.include ?? [];
    this.instructions = init?.instructions ?? "";
    this.previousResponseIds = init?.previousResponseIds ?? "";
    this.truncation = init?.truncation ?? "";

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

  private createInitialMessage(): ResponsesChatMessage<ToolCallLLMMessageOptions> {
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

  private handleResponseOutputMessage(
    item: OpenAILLM.Responses.ResponseOutputMessage,
    options: ResponsesAdditionalOptions,
  ): string {
    let outputContent = "";
    for (const part of item.content) {
      if ("text" in part) {
        outputContent += part.text;
      }
      if ("annotations" in part) {
        options.annotations = part.annotations;
      }
      if ("refusal" in part) {
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
  ): ResponsesChatMessage<ToolCallLLMMessageOptions> {
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
    const baseRequestParams = <OpenAILLM.Responses.ResponseCreateParams>{
      model: this.model,
      include: this.include,
      input: this.toOpenAIResponseMessage(messages),
      tools: tools?.map(this.toResponsesTool),
      instructions: this.instructions,
      max_output_tokens: this.maxOutputTokens,
      previous_response_id: this.previousResponseIds,
      store: this.store,
      metadata: this.callMetadata,
      top_p: this.topP,
      truncation: this.truncation,
      user: this.user,
      ...Object.assign({}, this.additionalChatOptions, additionalChatOptions),
    };

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
      //handle stream
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

  static toOpenAIResponsesRole(messageType: MessageType): OpenAIResponsesRole {
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

  toOpenAIResponseMessage(
    messages: ResponsesChatMessage<ToolCallLLMMessageOptions>[],
  ): OpenAILLM.Responses.ResponseInput {
    return messages.map((message) => {
      const options = message.options ?? {};
      // if the message has result from the tool call
      if ("toolResult" in options) {
        return {
          type: "function_call_output",
          call_id: options.toolResult.id,
          output: extractText(message.content),
        } satisfies OpenAILLM.Responses.ResponseInputItem.FunctionCallOutput;
      } else if ("toolCall" in options) {
        return;
      }
    });
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
