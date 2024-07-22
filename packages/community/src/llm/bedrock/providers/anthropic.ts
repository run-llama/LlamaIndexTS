import {
  type InvokeModelCommandInput,
  type InvokeModelWithResponseStreamCommandInput,
  ResponseStream,
} from "@aws-sdk/client-bedrock-runtime";
import type {
  BaseTool,
  ChatMessage,
  LLMMetadata,
  PartialToolCall,
  ToolCall,
  ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import {
  type BedrockAdditionalChatOptions,
  type BedrockChatStreamResponse,
  Provider,
} from "../provider";
import type {
  AnthropicNoneStreamingResponse,
  AnthropicStreamEvent,
  AnthropicTextContent,
  ToolBlock,
} from "../types";
import {
  mapBaseToolsToAnthropicTools,
  mapChatMessagesToAnthropicMessages,
  toUtf8,
} from "../utils";

export class AnthropicProvider extends Provider<AnthropicStreamEvent> {
  getResultFromResponse(
    response: Record<string, any>,
  ): AnthropicNoneStreamingResponse {
    return JSON.parse(toUtf8(response.body));
  }

  getToolsFromResponse<AnthropicToolContent>(
    response: Record<string, any>,
  ): AnthropicToolContent[] {
    const result = this.getResultFromResponse(response);
    return result.content
      .filter((item) => item.type === "tool_use")
      .map((item) => item as AnthropicToolContent);
  }

  getTextFromResponse(response: Record<string, any>): string {
    const result = this.getResultFromResponse(response);
    return result.content
      .filter((item) => item.type === "text")
      .map((item) => (item as AnthropicTextContent).text)
      .join(" ");
  }

  getTextFromStreamResponse(response: Record<string, any>): string {
    const event = this.getStreamingEventResponse(response);
    if (event?.type === "content_block_delta") {
      if (event.delta.type === "text_delta") return event.delta.text;
      if (event.delta.type === "input_json_delta")
        return event.delta.partial_json;
    }
    return "";
  }

  async *reduceStream(
    stream: AsyncIterable<ResponseStream>,
  ): BedrockChatStreamResponse {
    let collecting = [];
    let tool: ToolBlock | undefined = undefined;
    // #TODO this should be broken down into a separate consumer
    for await (const response of stream) {
      const event = this.getStreamingEventResponse(response);
      if (
        event?.type === "content_block_start" &&
        event.content_block.type === "tool_use"
      ) {
        tool = event.content_block;
        continue;
      }

      if (
        event?.type === "content_block_delta" &&
        event.delta.type === "input_json_delta"
      ) {
        collecting.push(event.delta.partial_json);
      }

      let options: undefined | ToolCallLLMMessageOptions = undefined;
      if (tool && collecting.length) {
        const input = collecting.filter((item) => item).join("");
        // We have all we need to parse the tool_use json
        if (event?.type === "content_block_stop") {
          options = {
            toolCall: [
              {
                id: tool.id,
                name: tool.name,
                input: JSON.parse(input),
              } as ToolCall,
            ],
          };
          // reset the collection/tool
          collecting = [];
          tool = undefined;
        } else {
          options = {
            toolCall: [
              {
                id: tool.id,
                name: tool.name,
                input,
              } as PartialToolCall,
            ],
          };
        }
      }
      const delta = this.getTextFromStreamResponse(response);
      if (!delta && !options) continue;

      yield {
        delta,
        options,
        raw: response,
      };
    }
  }

  getRequestBody<T extends ChatMessage<ToolCallLLMMessageOptions>>(
    metadata: LLMMetadata,
    messages: T[],
    tools?: BaseTool[],
    options?: BedrockAdditionalChatOptions,
  ): InvokeModelCommandInput | InvokeModelWithResponseStreamCommandInput {
    const extra: Record<string, unknown> = {};
    if (options?.toolChoice) {
      extra["tool_choice"] = options?.toolChoice;
    }
    const mapped = mapChatMessagesToAnthropicMessages(messages);
    return {
      modelId: metadata.model,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        messages: mapped,
        tools: mapBaseToolsToAnthropicTools(tools),
        max_tokens: metadata.maxTokens,
        temperature: metadata.temperature,
        top_p: metadata.topP,
        ...extra,
      }),
    };
  }
}
