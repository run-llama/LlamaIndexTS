import { wrapEventCaller } from "@llamaindex/core/decorator";
import {
  ToolCallLLM,
  type BaseTool,
  type ChatMessage,
  type ChatResponse,
  type ChatResponseChunk,
  type LLMChatParamsNonStreaming,
  type LLMChatParamsStreaming,
  type PartialToolCall,
  type ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import { extractText } from "@llamaindex/core/utils";
import { getEnv } from "@llamaindex/env";
import { type Mistral } from "@mistralai/mistralai";
import type {
  AssistantMessage,
  ChatCompletionRequest,
  ChatCompletionStreamRequest,
  ContentChunk,
  Tool,
  ToolMessage,
} from "@mistralai/mistralai/models/components";

export const ALL_AVAILABLE_MISTRAL_MODELS = {
  "mistral-tiny": { contextWindow: 32000 },
  "mistral-small": { contextWindow: 32000 },
  "mistral-medium": { contextWindow: 32000 },
  "mistral-small-latest": { contextWindow: 32000 },
  "mistral-large-latest": { contextWindow: 131000 },
  "codestral-latest": { contextWindow: 256000 },
  "pixtral-large-latest": { contextWindow: 131000 },
  "mistral-saba-latest": { contextWindow: 32000 },
  "ministral-3b-latest": { contextWindow: 131000 },
  "ministral-8b-latest": { contextWindow: 131000 },
  "mistral-embed": { contextWindow: 8000 },
  "mistral-moderation-latest": { contextWindow: 8000 },
};

export const TOOL_CALL_MISTRAL_MODELS = [
  "mistral-small-latest",
  "mistral-large-latest",
  "codestral-latest",
  "pixtral-large-latest",
  "ministral-8b-latest",
  "ministral-3b-latest",
];

export class MistralAISession {
  apiKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: any;

  constructor(init?: { apiKey?: string | undefined }) {
    if (init?.apiKey) {
      this.apiKey = init?.apiKey;
    } else {
      this.apiKey = getEnv("MISTRAL_API_KEY")!;
    }
    if (!this.apiKey) {
      throw new Error("Set Mistral API key in MISTRAL_API_KEY env variable"); // Overriding MistralAI package's error message
    }
  }

  async getClient(): Promise<Mistral> {
    const { Mistral } = await import("@mistralai/mistralai");
    if (!this.client) {
      this.client = new Mistral({
        apiKey: this.apiKey,
      });
    }
    return this.client;
  }
}

/**
 * MistralAI LLM implementation
 */
export class MistralAI extends ToolCallLLM<ToolCallLLMMessageOptions> {
  // Per completion MistralAI params
  model: keyof typeof ALL_AVAILABLE_MISTRAL_MODELS;
  temperature: number;
  topP: number;
  maxTokens?: number | undefined;
  apiKey?: string;
  safeMode: boolean;
  randomSeed?: number | undefined;

  private session: MistralAISession;

  constructor(init?: Partial<MistralAI>) {
    super();
    this.model = init?.model ?? "mistral-small-latest";
    this.temperature = init?.temperature ?? 0.1;
    this.topP = init?.topP ?? 1;
    this.maxTokens = init?.maxTokens ?? undefined;
    this.safeMode = init?.safeMode ?? false;
    this.randomSeed = init?.randomSeed ?? undefined;
    this.session = new MistralAISession(init);
  }

  get metadata() {
    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP,
      maxTokens: this.maxTokens,
      contextWindow: ALL_AVAILABLE_MISTRAL_MODELS[this.model].contextWindow,
      tokenizer: undefined,
      structuredOutput: false,
    };
  }

  get supportToolCall() {
    return TOOL_CALL_MISTRAL_MODELS.includes(this.metadata.model);
  }

  formatMessages(messages: ChatMessage<ToolCallLLMMessageOptions>[]) {
    return messages.map((message) => {
      const options = message.options ?? {};
      //tool call message
      if ("toolCall" in options) {
        return {
          role: "assistant",
          content: extractText(message.content),
          toolCalls: options.toolCall.map((toolCall) => {
            return {
              id: toolCall.id,
              type: "function",
              function: {
                name: toolCall.name,
                arguments: toolCall.input,
              },
            };
          }),
        } satisfies AssistantMessage;
      }

      //tool result message
      if ("toolResult" in options) {
        return {
          role: "tool",
          content: extractText(message.content),
          toolCallId: options.toolResult.id,
        } satisfies ToolMessage;
      }

      return {
        role: message.role,
        content: extractText(message.content),
      };
    });
  }

  private buildParams(
    messages: ChatMessage<ToolCallLLMMessageOptions>[],
    tools?: BaseTool[],
  ) {
    return {
      model: this.model,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
      topP: this.topP,
      safeMode: this.safeMode,
      randomSeed: this.randomSeed,
      messages: this.formatMessages(messages),
      tools: tools?.map(MistralAI.toTool),
    };
  }

  static toTool(tool: BaseTool): Tool {
    if (!tool.metadata.parameters) {
      throw new Error("Tool parameters are required");
    }

    return {
      type: "function",
      function: {
        name: tool.metadata.name,
        description: tool.metadata.description,
        parameters: tool.metadata.parameters,
      },
    };
  }

  chat(
    params: LLMChatParamsStreaming,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  chat(
    params: LLMChatParamsNonStreaming<ToolCallLLMMessageOptions>,
  ): Promise<ChatResponse>;
  async chat(
    params: LLMChatParamsNonStreaming | LLMChatParamsStreaming,
  ): Promise<
    | ChatResponse<ToolCallLLMMessageOptions>
    | AsyncIterable<ChatResponseChunk<ToolCallLLMMessageOptions>>
  > {
    const { messages, stream, tools } = params;
    // Streaming
    if (stream) {
      return this.streamChat(messages, tools);
    }
    // Non-streaming
    const client = await this.session.getClient();
    const buildParams = this.buildParams(messages, tools);
    const response = await client.chat.complete(
      buildParams as ChatCompletionRequest,
    );

    if (!response || !response.choices || !response.choices[0]) {
      throw new Error("Unexpected response format from Mistral API");
    }

    // Extract the content from the message response
    const content = response.choices[0].message.content;

    return {
      raw: response,
      message: {
        role: "assistant",
        content: this.extractContentAsString(content),
        options: response.choices[0]!.message?.toolCalls
          ? {
              toolCall: response.choices[0]!.message.toolCalls.map(
                (toolCall) => ({
                  id: toolCall.id,
                  name: toolCall.function.name,
                  input: this.extractArgumentsAsString(
                    toolCall.function.arguments,
                  ),
                }),
              ),
            }
          : {},
      },
    };
  }

  @wrapEventCaller
  protected async *streamChat(
    messages: ChatMessage[],
    tools?: BaseTool[],
  ): AsyncIterable<ChatResponseChunk<ToolCallLLMMessageOptions>> {
    const client = await this.session.getClient();
    const buildParams = this.buildParams(
      messages,
      tools,
    ) as ChatCompletionStreamRequest;
    const chunkStream = await client.chat.stream(buildParams);

    let currentToolCall: PartialToolCall | null = null;
    const toolCallMap = new Map<string, PartialToolCall>();

    for await (const chunk of chunkStream) {
      if (!chunk.data?.choices?.[0]?.delta) continue;

      const choice = chunk.data.choices[0];
      if (!(choice.delta.content || choice.delta.toolCalls)) continue;

      let shouldEmitToolCall: PartialToolCall | null = null;

      if (choice.delta.toolCalls?.[0]) {
        const toolCall = choice.delta.toolCalls[0];

        if (toolCall.id) {
          if (currentToolCall && toolCall.id !== currentToolCall.id) {
            shouldEmitToolCall = {
              ...currentToolCall,
              input: JSON.parse(currentToolCall.input),
            };
          }

          currentToolCall = {
            id: toolCall.id,
            name: toolCall.function!.name!,
            input: this.extractArgumentsAsString(toolCall.function!.arguments),
          };

          toolCallMap.set(toolCall.id, currentToolCall!);
        } else if (currentToolCall && toolCall.function?.arguments) {
          currentToolCall.input += this.extractArgumentsAsString(
            toolCall.function.arguments,
          );
        }
      }

      const isDone: boolean = choice.finishReason !== null;

      if (isDone && currentToolCall) {
        //emitting last tool call
        shouldEmitToolCall = {
          ...currentToolCall,
          input: JSON.parse(currentToolCall.input),
        };
      }

      yield {
        raw: chunk.data,
        delta: this.extractContentAsString(choice.delta.content),
        options: shouldEmitToolCall
          ? { toolCall: [shouldEmitToolCall] }
          : currentToolCall
            ? { toolCall: [currentToolCall] }
            : {},
      };
    }

    toolCallMap.clear();
  }

  private extractArgumentsAsString(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: string | { [k: string]: any } | null | undefined,
  ): string {
    return typeof args === "string" ? args : JSON.stringify(args) || "";
  }

  private extractContentAsString(
    content: string | ContentChunk[] | null | undefined,
  ): string {
    if (Array.isArray(content)) {
      return content
        .map((chunk) => (chunk.type === "text" ? chunk.text : undefined))
        .filter(Boolean)
        .join("");
    }
    return content ?? "";
  }
}

/**
 * Convenience function to create a new MistralAI instance.
 * @param init - Optional initialization parameters for the MistralAI instance.
 * @returns A new MistralAI instance.
 */
export const mistral = (init?: ConstructorParameters<typeof MistralAI>[0]) =>
  new MistralAI(init);
