import type {
  ContentBlockDelta,
  ConverseOutput,
  ConverseRequest,
  ConverseResponse,
  ConverseStreamOutput,
  InvokeModelCommandInput,
  InvokeModelWithResponseStreamCommandInput,
  ResponseStream,
} from "@aws-sdk/client-bedrock-runtime";
import type {
  BaseTool,
  ChatMessage,
  LLMMetadata,
  ToolCall,
  ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import { toUtf8 } from "../utils";

import { Provider, type BedrockChatStreamResponse } from "../provider";
import {
  mapBaseToolsToAmazonTools,
  mapChatMessagesToAmazonMessages,
} from "./utils";

export class AmazonProvider extends Provider<ConverseStreamOutput> {
  getResultFromResponse(response: Record<string, any>): ConverseResponse {
    return JSON.parse(toUtf8(response.body));
  }

  getToolsFromResponse<ToolContent>(response: ConverseOutput): ToolContent[] {
    return (
      response.message?.content
        ?.filter((item) => item.toolUse)
        .map(
          (item) =>
            ({
              id: item.toolUse!.toolUseId,
              name: item.toolUse!.name,
              input: item.toolUse!.input
                ? JSON.parse(item.toolUse!.input as string)
                : "",
            }) as ToolContent,
        ) ?? []
    );
  }

  getTextFromResponse(response: ConverseResponse): string {
    const result = this.getResultFromResponse(response);
    const content = result.output?.message?.content ?? [];
    return content.map((item) => item.text).join(" ");
  }

  getTextFromStreamResponse(response: ResponseStream): string {
    let event: ConverseStreamOutput | undefined =
      this.getStreamingEventResponse(response);
    if (!event || !event.contentBlockDelta) return "";
    const delta: ContentBlockDelta | undefined = event.contentBlockDelta.delta;
    return delta?.text || "";
  }

  async *reduceStream(
    stream: AsyncIterable<ResponseStream>,
  ): BedrockChatStreamResponse {
    let toolId: string | undefined = undefined;
    let toolName: string | undefined = undefined;
    for await (const response of stream) {
      const event = this.getStreamingEventResponse(response);
      const delta = this.getTextFromStreamResponse(response);

      let options: undefined | ToolCallLLMMessageOptions = undefined;
      if (event?.contentBlockStart && event.contentBlockStart.start?.toolUse) {
        toolId = event.contentBlockStart.start?.toolUse.toolUseId;
        toolName = event.contentBlockStart.start?.toolUse.name;
        continue;
      }
      if (
        toolId &&
        toolName &&
        event?.contentBlockDelta?.delta?.toolUse?.input
      ) {
        options = {
          toolCall: [
            {
              id: toolId,
              name: toolName,
              input: JSON.parse(event?.contentBlockDelta?.delta?.toolUse.input),
            } as ToolCall,
          ],
        };
        toolId = undefined;
        toolName = undefined;
      }

      if (!delta && !options) continue;

      yield {
        delta: options ? "" : delta,
        options,
        raw: response,
      };
    }
  }

  getRequestBody<T extends ChatMessage>(
    metadata: LLMMetadata,
    messages: T[],
    tools: BaseTool[] = [],
    options: Omit<ConverseRequest, "modelId" | "messages" | "inferenceConfig">,
  ): InvokeModelCommandInput | InvokeModelWithResponseStreamCommandInput {
    const request: Omit<ConverseRequest, "modelId"> = {
      ...options,
      messages: mapChatMessagesToAmazonMessages(messages),
      inferenceConfig: {
        maxTokens: metadata.maxTokens,
        temperature: metadata.temperature,
        topP: metadata.topP,
      },
    };
    if (tools.length) {
      request.toolConfig = {
        tools: mapBaseToolsToAmazonTools(tools),
      };
    }

    return {
      modelId: metadata.model,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(request),
    };
  }
}
