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
import type { ToolChoice } from "./types";
import { toUtf8 } from "./utils";

export type BedrockAdditionalChatOptions = { toolChoice: ToolChoice };

export type BedrockChatStreamResponse = AsyncIterable<
  ChatResponseChunk<ToolCallLLMMessageOptions>
>;

export abstract class Provider<ProviderStreamEvent extends {} = {}> {
  abstract getTextFromResponse(response: Record<string, any>): string;

  // Return tool calls from none streaming calls
  abstract getToolsFromResponse<T extends {} = {}>(
    response: Record<string, any>,
  ): T[];

  getStreamingEventResponse(
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
