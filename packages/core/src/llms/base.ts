import { emptyLogger } from "@llamaindex/env";
import type { JSONObject } from "../global";
import { tool } from "../tools/";
import { extractText } from "../utils/llms";
import { streamConverter } from "../utils/stream";
import {
  isZodSchema,
  safeParseSchema,
  type ZodInfer,
  type ZodSchema,
} from "../zod";
import {
  callToolToMessage,
  getToolCallsFromResponse,
  type CallToolToMessageResult,
} from "./tool-call";
import type {
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  CompletionResponse,
  ExecResponse,
  ExecStreamResponse,
  LLM,
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
  LLMCompletionParamsNonStreaming,
  LLMCompletionParamsStreaming,
  LLMMetadata,
  PartialToolCall,
  ToolCallLLMMessageOptions,
} from "./type";

const STRUCTURED_OUTPUT_TOOL_NAME = "format_output";

export abstract class BaseLLM<
  AdditionalChatOptions extends object = object,
  AdditionalMessageOptions extends object = object,
> implements LLM<AdditionalChatOptions>
{
  abstract metadata: LLMMetadata;

  complete(
    params: LLMCompletionParamsStreaming,
  ): Promise<AsyncIterable<CompletionResponse>>;
  complete(
    params: LLMCompletionParamsNonStreaming,
  ): Promise<CompletionResponse>;
  async complete(
    params: LLMCompletionParamsStreaming | LLMCompletionParamsNonStreaming,
  ): Promise<CompletionResponse | AsyncIterable<CompletionResponse>> {
    const { prompt, stream, responseFormat } = params;
    if (stream) {
      const stream = await this.chat({
        messages: [{ content: prompt, role: "user" }],
        stream: true,
        ...(responseFormat ? { responseFormat } : {}),
      });
      return streamConverter(stream, (chunk) => {
        return {
          raw: null,
          text: chunk.delta,
        };
      });
    }

    const chatResponse = await this.chat({
      messages: [{ content: prompt, role: "user" }],
      ...(responseFormat ? { responseFormat } : {}),
    });

    return {
      text: extractText(chatResponse.message.content),
      raw: chatResponse.raw,
    };
  }

  abstract chat(
    params: LLMChatParamsStreaming<
      AdditionalChatOptions,
      AdditionalMessageOptions
    >,
  ): Promise<AsyncIterable<ChatResponseChunk<AdditionalMessageOptions>>>;
  abstract chat(
    params: LLMChatParamsNonStreaming<
      AdditionalChatOptions,
      AdditionalMessageOptions
    >,
  ): Promise<ChatResponse<AdditionalMessageOptions>>;

  exec<Z extends ZodSchema>(
    params: LLMChatParamsStreaming<
      AdditionalChatOptions,
      AdditionalMessageOptions,
      Z
    >,
  ): Promise<ExecStreamResponse<AdditionalMessageOptions, ZodInfer<Z>>>;
  exec<Z extends ZodSchema>(
    params: LLMChatParamsNonStreaming<
      AdditionalChatOptions,
      AdditionalMessageOptions,
      Z
    >,
  ): Promise<ExecResponse<AdditionalMessageOptions, ZodInfer<Z>>>;
  async exec<Z extends ZodSchema>(
    params:
      | LLMChatParamsStreaming<
          AdditionalChatOptions,
          AdditionalMessageOptions,
          Z
        >
      | LLMChatParamsNonStreaming<
          AdditionalChatOptions,
          AdditionalMessageOptions,
          Z
        >,
  ): Promise<
    | ExecResponse<AdditionalMessageOptions, ZodInfer<Z>>
    | ExecStreamResponse<AdditionalMessageOptions, ZodInfer<Z>>
  > {
    const responseFormat = params.responseFormat;
    if (typeof responseFormat != "undefined" && isZodSchema(responseFormat)) {
      const structuredTool = tool({
        name: STRUCTURED_OUTPUT_TOOL_NAME,
        description: "Respond with a JSON object",
        parameters: responseFormat,
        execute: (args) => {
          const result = safeParseSchema(responseFormat, args);
          if (!result.success) {
            console.error("Invalid input from LLM:", result.error);
            return JSON.stringify({
              error: "Invalid schema",
              details: result.error,
            });
          }
          return result.data as JSONObject;
        },
      });
      if (Array.isArray(params.tools)) {
        params.tools.push(structuredTool);
      } else {
        params.tools = [structuredTool];
      }
      params.responseFormat = undefined;
    }
    if (params.stream) {
      return this.streamExec(params);
    }
    const logger = params.logger ?? emptyLogger;
    const newMessages: ChatMessage<AdditionalMessageOptions>[] = [];
    const response = await this.chat(params);
    newMessages.push(response.message);
    const toolCalls = getToolCallsFromResponse(response);

    let structuredOutput: ZodInfer<Z> | undefined = undefined;
    if (params.tools && toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        const toolResultMessage = await callToolToMessage(
          params.tools,
          toolCall,
          logger,
        );
        if (toolResultMessage) {
          newMessages.push(
            toolResultMessage as ChatMessage<AdditionalMessageOptions>,
          );
        }
        if (toolCall.name === STRUCTURED_OUTPUT_TOOL_NAME) {
          structuredOutput = toolResultMessage?.options?.toolResult
            ?.result as ZodInfer<Z>;
        }
      }
    }
    return {
      newMessages,
      toolCalls,
      object: structuredOutput,
    };
  }

  async streamExec<Z extends ZodSchema>(
    params: LLMChatParamsStreaming<
      AdditionalChatOptions,
      AdditionalMessageOptions,
      Z
    >,
  ): Promise<ExecStreamResponse<AdditionalMessageOptions, ZodInfer<Z>>> {
    const logger = params.logger ?? emptyLogger;
    const responseStream = await this.chat(params);
    const iterator = responseStream[Symbol.asyncIterator]();
    const first = await iterator.next();

    // Set firstChunk to null if empty
    const firstChunk = !first.done ? first.value : null;

    const hasToolCallsInFirst =
      firstChunk?.options && "toolCall" in firstChunk.options;

    if (!hasToolCallsInFirst) {
      // extract structured output from the last message
      const lastMessage = params.messages[params.messages.length - 1];
      const toolResult = (
        lastMessage?.options as { toolResult: CallToolToMessageResult }
      )?.toolResult;
      const structuredOutput =
        toolResult?.name === STRUCTURED_OUTPUT_TOOL_NAME
          ? (toolResult.result as ZodInfer<Z>)
          : undefined;

      let content = firstChunk?.delta ?? "";
      let finished = false;
      return {
        stream: (async function* () {
          if (firstChunk) {
            yield firstChunk;
          }
          for await (const chunk of {
            [Symbol.asyncIterator]: () => iterator,
          }) {
            content += chunk.delta;
            yield chunk;
          }
          finished = true;
        })(),
        toolCalls: [],
        newMessages() {
          if (!finished) {
            throw new Error(
              "New messages are not ready yet. Call newMessages() after the stream is done.",
            );
          }
          return content
            ? [
                {
                  role: "assistant",
                  content,
                } as ChatMessage<AdditionalMessageOptions>,
              ]
            : [];
        },
        object: structuredOutput,
      };
    }
    // Helper function to process a chunk
    function processChunk(
      chunk: ChatResponseChunk,
      toolCallMap: Map<string, PartialToolCall>,
    ): ChatResponseChunk | null {
      if (chunk.options && "toolCall" in chunk.options) {
        // update tool call map
        for (const toolCall of chunk.options.toolCall as PartialToolCall[]) {
          if (toolCall.id) {
            toolCallMap.set(toolCall.id, toolCall);
          }
        }
        // return the current full response with the tool calls
        const toolCalls = Array.from(toolCallMap.values());
        return {
          ...chunk,
          options: {
            ...chunk.options,
            toolCall: toolCalls,
          },
        };
      }
      return null;
    }
    // Collect for tool call
    let fullResponse: ChatResponseChunk | null = null;
    const toolCallMap = new Map<string, PartialToolCall>();
    // Process first chunk
    fullResponse = processChunk(firstChunk, toolCallMap);
    // Process remaining chunks
    while (true) {
      const next = await iterator.next();
      if (next.done) break;
      const chunk = next.value;
      const potentialFull = processChunk(chunk, toolCallMap);
      if (potentialFull) {
        fullResponse = potentialFull;
      }
    }
    if (params.tools && fullResponse) {
      const toolCalls = getToolCallsFromResponse(fullResponse);
      const messages: ChatMessage<AdditionalMessageOptions>[] = [];
      messages.push({
        role: "assistant",
        content: "",
        options: {
          toolCall: toolCalls,
        } as AdditionalMessageOptions,
      });
      let structuredOutput: ZodInfer<Z> | undefined = undefined;
      for (const toolCall of toolCalls) {
        const toolResultMessage = await callToolToMessage(
          params.tools,
          toolCall,
          logger,
        );
        if (toolResultMessage) {
          messages.push(
            toolResultMessage as ChatMessage<AdditionalMessageOptions>,
          );
        }
        if (toolCall.name === STRUCTURED_OUTPUT_TOOL_NAME) {
          structuredOutput = toolResultMessage?.options?.toolResult
            ?.result as ZodInfer<Z>;
        }
      }
      return {
        stream: (async function* () {})(),
        newMessages() {
          return messages;
        },
        toolCalls,
        object: structuredOutput,
      };
    } else {
      throw new Error("Cannot get tool calls from response");
    }
  }
}

export abstract class ToolCallLLM<
  AdditionalChatOptions extends object = object,
  AdditionalMessageOptions extends
    ToolCallLLMMessageOptions = ToolCallLLMMessageOptions,
> extends BaseLLM<AdditionalChatOptions, AdditionalMessageOptions> {
  abstract supportToolCall: boolean;
}
