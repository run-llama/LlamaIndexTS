import { extractText } from "../utils/llms";
import { streamConverter } from "../utils/stream";
import { callTool, getToolCallsFromResponse } from "./tool-call";
import type {
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  CompletionResponse,
  ExecResponse,
  LLM,
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
  LLMCompletionParamsNonStreaming,
  LLMCompletionParamsStreaming,
  LLMMetadata,
  PartialToolCall,
  ToolCallLLMMessageOptions,
} from "./type";

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
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  abstract chat(
    params: LLMChatParamsNonStreaming<
      AdditionalChatOptions,
      AdditionalMessageOptions
    >,
  ): Promise<ChatResponse<AdditionalMessageOptions>>;

  exec(
    params: LLMChatParamsStreaming<
      AdditionalChatOptions,
      AdditionalMessageOptions
    >,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  exec(
    params: LLMChatParamsNonStreaming<
      AdditionalChatOptions,
      AdditionalMessageOptions
    >,
  ): Promise<ExecResponse<AdditionalMessageOptions>>;
  async exec(
    params:
      | LLMChatParamsStreaming<AdditionalChatOptions, AdditionalMessageOptions>
      | LLMChatParamsNonStreaming<
          AdditionalChatOptions,
          AdditionalMessageOptions
        >,
  ): Promise<
    ExecResponse<AdditionalMessageOptions> | AsyncIterable<ChatResponseChunk>
  > {
    if (params.stream) {
      return this.streamExec(params);
    }
    const response = await this.chat(params);
    const toolCalls = getToolCallsFromResponse(response);
    if (params.tools && toolCalls.length > 0) {
      const messages: ChatMessage<AdditionalMessageOptions>[] = [];
      for (const toolCall of toolCalls) {
        messages.push(response.message);
        const toolResultMessage = await callTool<AdditionalMessageOptions>(
          params.tools,
          toolCall,
        );
        if (toolResultMessage) {
          messages.push(toolResultMessage);
        }
      }
      return {
        messages,
        toolCalls,
      };
    } else {
      return {
        messages: [response.message],
        toolCalls: [],
      };
    }
  }

  async *streamExec({
    messages,
    tools,
  }: LLMChatParamsStreaming<
    AdditionalChatOptions,
    AdditionalMessageOptions
  >): AsyncIterable<ChatResponseChunk> {
    const responseStream = await this.chat({
      messages,
      tools,
      stream: true,
    });
    const iterator = responseStream[Symbol.asyncIterator]();
    const first = await iterator.next();
    if (first.done) {
      return;
    }
    const firstChunk = first.value;
    const hasToolCallsInFirst =
      firstChunk.options && "toolCall" in firstChunk.options;
    if (!hasToolCallsInFirst) {
      yield firstChunk;
      while (true) {
        const next = await iterator.next();
        if (next.done) break;
        yield next.value;
      }
      return;
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
    if (fullResponse) {
      const toolCalls = getToolCallsFromResponse(fullResponse);
      for (const toolCall of toolCalls) {
        const tool = tools?.find((t) => t.metadata.name === toolCall.name);
        if (tool) {
          await tool.call?.(toolCall.input);
        }
      }
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
