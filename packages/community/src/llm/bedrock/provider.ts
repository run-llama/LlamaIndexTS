import {
  type InvokeModelCommandInput,
  type InvokeModelWithResponseStreamCommandInput,
  ResponseStream,
} from "@aws-sdk/client-bedrock-runtime";
import {
  type BaseTool,
  type ChatMessage,
  type ChatResponseChunk,
  type LLMMetadata,
  type ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import { streamConverter } from "@llamaindex/core/utils";
import { toUtf8 } from "./utils";

export type BedrockAdditionalChatOptions = Record<string, unknown>;

export type BedrockChatStreamResponse = AsyncIterable<
  ChatResponseChunk<ToolCallLLMMessageOptions>
>;

export abstract class Provider<ProviderStreamEvent extends object = object> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract getTextFromResponse(response: Record<string, any>): string;

  // Return tool calls from none streaming calls
  abstract getToolsFromResponse<T extends object = object>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response: Record<string, any>,
  ): T[];

  getStreamingEventResponse(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response: Record<string, any>,
  ): ProviderStreamEvent | undefined {
    return response.chunk?.bytes
      ? (JSON.parse(toUtf8(response.chunk?.bytes)) as ProviderStreamEvent)
      : undefined;
  }

  async *reduceStream(
    stream: AsyncIterable<ResponseStream>,
  ): BedrockChatStreamResponse {
    yield* streamConverter(stream, (response) => {
      return {
        delta: this.getTextFromStreamResponse(response),
        raw: response,
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTextFromStreamResponse(response: Record<string, any>): string {
    return this.getTextFromResponse(response);
  }

  abstract getRequestBody<T extends ChatMessage>(
    metadata: LLMMetadata,
    messages: T[],
    tools?: BaseTool[],
    options?: BedrockAdditionalChatOptions,
  ): InvokeModelCommandInput | InvokeModelWithResponseStreamCommandInput;
}
