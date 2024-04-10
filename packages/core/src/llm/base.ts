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
} from "./types.js";
import { extractText, streamConverter } from "./utils.js";

export abstract class BaseLLM<
  AdditionalChatOptions extends Record<string, unknown> = Record<
    string,
    unknown
  >,
  AdditionalMessageOptions extends Record<string, unknown> = Record<
    string,
    unknown
  >,
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
    const { prompt, stream } = params;
    if (stream) {
      const stream = await this.chat({
        messages: [{ content: prompt, role: "user" }],
        stream: true,
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
    });
    return {
      text: extractText(chatResponse.message.content),
      raw: chatResponse.raw,
    };
  }

  abstract chat(
    params: LLMChatParamsStreaming<AdditionalChatOptions>,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  abstract chat(
    params: LLMChatParamsNonStreaming<AdditionalChatOptions>,
  ): Promise<ChatResponse<AdditionalMessageOptions>>;
}
