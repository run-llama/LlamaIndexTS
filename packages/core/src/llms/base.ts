import { extractText } from "../utils/llms";
import { streamConverter } from "../utils/stream";
import { getToolCallsFromResponse } from "./tool-call";
import type {
  ChatResponse,
  ChatResponseChunk,
  CompletionResponse,
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

  async *exec({
    messages,
    tools,
  }: LLMChatParamsStreaming<
    AdditionalChatOptions,
    AdditionalMessageOptions
  >): AsyncIterable<ChatResponseChunk> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    const responseGenerator = async function* (): AsyncGenerator<
      boolean | ChatResponseChunk,
      void,
      unknown
    > {
      const responseStream = await that.chat({
        messages,
        tools,
        stream: true,
      });

      let fullResponse = null;
      let yieldedIndicator = false;
      const toolCallMap = new Map();
      for await (const chunk of responseStream) {
        const hasToolCalls = chunk.options && "toolCall" in chunk.options;
        if (!hasToolCalls) {
          if (!yieldedIndicator) {
            yield false;
            yieldedIndicator = true;
          }
          yield chunk;
        } else if (!yieldedIndicator) {
          yield true;
          yieldedIndicator = true;
        }

        if (chunk.options && "toolCall" in chunk.options) {
          for (const toolCall of chunk.options.toolCall as PartialToolCall[]) {
            if (toolCall.id) {
              toolCallMap.set(toolCall.id, toolCall);
            }
          }
        }

        if (
          hasToolCalls &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (chunk.raw as any)?.choices?.[0]?.finish_reason !== null
        ) {
          // Update the fullResponse with the tool calls
          const toolCalls = Array.from(toolCallMap.values());
          fullResponse = {
            ...chunk,
            options: {
              ...chunk.options,
              toolCall: toolCalls,
            },
          };
        }
      }

      if (fullResponse) {
        yield fullResponse;
      }
    };

    const generator = responseGenerator();
    const isToolCall = await generator.next();

    if (isToolCall.value) {
      // If it's a tool call, we need to wait for the full response
      let fullResponse = null;
      for await (const chunk of generator) {
        fullResponse = chunk;
      }

      if (fullResponse) {
        const responseChunk = fullResponse as ChatResponseChunk;
        const toolCalls = getToolCallsFromResponse(responseChunk);
        for (const toolCall of toolCalls) {
          const tool = tools?.find((t) => t.metadata.name === toolCall.name);
          if (tool) {
            await tool.call?.(toolCall.input);
          }
        }
        return; // End of generation
      } else {
        throw new Error("Cannot get tool calls from response");
      }
    }

    for await (const chunk of generator) {
      yield chunk as ChatResponseChunk;
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
