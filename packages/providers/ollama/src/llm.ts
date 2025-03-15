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

async function getZod() {
  try {
    return await import("zod");
  } catch (e) {
    throw new Error("zod is required for structured output");
  }
}

async function getZodToJsonSchema() {
  try {
    return await import("zod-to-json-schema");
  } catch (e) {
    throw new Error("zod-to-json-schema is required for structured output");
  }
}

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
      structuredOutput: true,
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
    const { messages, stream, tools, responseFormat } = params;
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

    if (responseFormat && this.metadata.structuredOutput) {
      const [{ zodToJsonSchema }, { z }] = await Promise.all([
        getZodToJsonSchema(),
        getZod(),
      ]);
      if (responseFormat instanceof z.ZodType)
        payload.format = zodToJsonSchema(responseFormat);
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

/**
 * Convenience function to create a new Ollama instance.
 * @param init - Optional initialization parameters for the Ollama instance.
 * @returns A new Ollama instance.
 */
export const ollama = (init: ConstructorParameters<typeof Ollama>[0]) =>
  new Ollama(init);
