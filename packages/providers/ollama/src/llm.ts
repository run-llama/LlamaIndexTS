import { wrapLLMEvent } from "@llamaindex/core/decorator";
import {
  ToolCallLLM,
  type BaseTool,
  type ChatResponse,
  type ChatResponseChunk,
  type CompletionResponse,
  type LLMChatParamsNonStreaming,
  type LLMChatParamsStreaming,
  type LLMCompletionParamsNonStreaming,
  type LLMCompletionParamsStreaming,
  type LLMMetadata,
  type ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import { extractText, streamConverter } from "@llamaindex/core/utils";
import { randomUUID } from "@llamaindex/env";
import type { ChatRequest, GenerateRequest, Tool } from "ollama";
import {
  Ollama as OllamaBase,
  type Config,
  type ChatResponse as OllamaChatResponse,
  type GenerateResponse as OllamaGenerateResponse,
  type Options,
} from "ollama/browser";

const messageAccessor = (
  part: OllamaChatResponse,
): ChatResponseChunk<ToolCallLLMMessageOptions> => {
  if (part.message.tool_calls) {
    return {
      raw: part,
      delta: part.message.content,
      options: {
        toolCall: part.message.tool_calls.map((toolCall) => ({
          name: toolCall.function.name,
          input: toolCall.function.arguments,
          id: randomUUID(),
        })),
      },
    };
  }
  return {
    raw: part,
    delta: part.message.content,
  };
};

const completionAccessor = (
  part: OllamaGenerateResponse,
): CompletionResponse => {
  return { text: part.response, raw: part };
};

export type OllamaParams = {
  model: string;
  config?: Partial<Config>;
  options?: Partial<Options>;
};

export class Ollama extends ToolCallLLM {
  supportToolCall: boolean = true;
  public readonly ollama: OllamaBase;

  // https://ollama.ai/library
  model: string;

  options: Partial<Omit<Options, "num_ctx" | "top_p" | "temperature">> &
    Pick<Options, "num_ctx" | "top_p" | "temperature"> = {
    num_ctx: 4096,
    top_p: 0.9,
    temperature: 0.7,
  };

  constructor(params: OllamaParams) {
    super();
    this.model = params.model;
    this.ollama = new OllamaBase(params.config);
    if (params.options) {
      this.options = {
        ...this.options,
        ...params.options,
      };
    }
  }

  get metadata(): LLMMetadata {
    const { temperature, top_p, num_ctx } = this.options;
    return {
      model: this.model,
      temperature: temperature,
      topP: top_p,
      maxTokens: this.options.num_ctx,
      contextWindow: num_ctx,
      tokenizer: undefined,
    };
  }

  chat(
    params: LLMChatParamsStreaming<ToolCallLLMMessageOptions>,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  chat(
    params: LLMChatParamsNonStreaming<ToolCallLLMMessageOptions>,
  ): Promise<ChatResponse<ToolCallLLMMessageOptions>>;
  @wrapLLMEvent
  async chat(
    params:
      | LLMChatParamsNonStreaming<object, ToolCallLLMMessageOptions>
      | LLMChatParamsStreaming<object, ToolCallLLMMessageOptions>,
  ): Promise<
    ChatResponse<ToolCallLLMMessageOptions> | AsyncIterable<ChatResponseChunk>
  > {
    const { messages, stream, tools } = params;
    const payload: ChatRequest = {
      model: this.model,
      messages: messages.map((message) => {
        if (message.options && "toolResult" in message.options) {
          return {
            role: "tool",
            content: message.options.toolResult.result,
          };
        }

        return {
          role: message.role,
          content: extractText(message.content),
        };
      }),
      stream: !!stream,
      options: {
        ...this.options,
      },
    };
    if (tools) {
      payload.tools = tools.map((tool) => Ollama.toTool(tool));
    }
    if (!stream) {
      const chatResponse = await this.ollama.chat({
        ...payload,
        stream: false,
      });
      if (chatResponse.message.tool_calls) {
        return {
          message: {
            role: "assistant",
            content: chatResponse.message.content,
            options: {
              toolCall: chatResponse.message.tool_calls.map((toolCall) => ({
                name: toolCall.function.name,
                input: toolCall.function.arguments,
                id: randomUUID(),
              })),
            },
          },
          raw: chatResponse,
        };
      }

      return {
        message: {
          role: "assistant",
          content: chatResponse.message.content,
        },
        raw: chatResponse,
      };
    } else {
      const stream = await this.ollama.chat({
        ...payload,
        stream: true,
      });
      return streamConverter(stream, messageAccessor);
    }
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
    const { prompt, stream } = params;
    const payload: GenerateRequest = {
      model: this.model,
      prompt: extractText(prompt),
      stream: !!stream,
      options: {
        ...this.options,
      },
    };
    if (!stream) {
      const response = await this.ollama.generate({
        ...payload,
        stream: false,
      });
      return {
        text: response.response,
        raw: response,
      };
    } else {
      const stream = await this.ollama.generate({
        ...payload,
        stream: true,
      });
      return streamConverter(stream, completionAccessor);
    }
  }

  static toTool(tool: BaseTool): Tool {
    return {
      type: "function",
      function: {
        name: tool.metadata.name,
        description: tool.metadata.description,
        parameters: {
          type: tool.metadata.parameters?.type,
          required: tool.metadata.parameters?.required,
          properties: tool.metadata.parameters?.properties,
        },
      },
    };
  }
}
