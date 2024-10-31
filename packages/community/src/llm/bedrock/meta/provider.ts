import type {
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
import type { MetaNoneStreamingResponse, MetaStreamEvent } from "./types";

import { randomUUID } from "@llamaindex/env";
import { Provider, type BedrockChatStreamResponse } from "../provider";
import { TOKENS } from "./constants";
import {
  mapChatMessagesToMetaLlama2Messages,
  mapChatMessagesToMetaLlama3Messages,
} from "./utils";

export class MetaProvider extends Provider<MetaStreamEvent> {
  getResultFromResponse(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response: Record<string, any>,
  ): MetaNoneStreamingResponse {
    return JSON.parse(toUtf8(response.body));
  }

  getToolsFromResponse<ToolContent>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response: Record<string, any>,
  ): ToolContent[] {
    const result = this.getResultFromResponse(response);
    if (!result.generation.trim().startsWith(TOKENS.TOOL_CALL)) return [];
    const tool = JSON.parse(
      result.generation.trim().split(TOKENS.TOOL_CALL)[1]!,
    );
    return [
      {
        id: randomUUID(),
        name: tool.name,
        input: tool.parameters,
      } as ToolContent,
    ];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTextFromResponse(response: Record<string, any>): string {
    const result = this.getResultFromResponse(response);
    if (result.generation.trim().startsWith(TOKENS.TOOL_CALL)) return "";
    return result.generation;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTextFromStreamResponse(response: Record<string, any>): string {
    const event = this.getStreamingEventResponse(response);
    if (event?.generation) {
      return event.generation;
    }
    return "";
  }

  async *reduceStream(
    stream: AsyncIterable<ResponseStream>,
  ): BedrockChatStreamResponse {
    const collecting: string[] = [];
    let toolId: string | undefined = undefined;
    for await (const response of stream) {
      const event = this.getStreamingEventResponse(response);
      const delta = this.getTextFromStreamResponse(response);

      // odd quirk of llama3.1, start token is \n\n
      if (
        !toolId &&
        !event?.generation.trim() &&
        event?.generation_token_count === 1 &&
        event?.prompt_token_count !== null
      )
        continue;

      if (delta.startsWith(TOKENS.TOOL_CALL)) {
        toolId = randomUUID();
        const parts = delta.split(TOKENS.TOOL_CALL).filter((part) => part);
        collecting.push(...parts);
        continue;
      }

      let options: undefined | ToolCallLLMMessageOptions = undefined;
      if (toolId && event?.stop_reason === "stop") {
        if (delta) collecting.push(delta);
        const tool = JSON.parse(collecting.join(""));
        options = {
          toolCall: [
            {
              id: toolId,
              name: tool.name,
              input: tool.parameters,
            } as ToolCall,
          ],
        };
      } else if (toolId && !event?.stop_reason) {
        collecting.push(delta);
        continue;
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
  ): InvokeModelCommandInput | InvokeModelWithResponseStreamCommandInput {
    let prompt: string = "";
    let images: string[] = [];
    if (metadata.model.startsWith("meta.llama3")) {
      const mapped = mapChatMessagesToMetaLlama3Messages({
        messages,
        tools,
        model: metadata.model,
      });
      prompt = mapped.prompt;
      images = mapped.images;
    } else if (metadata.model.startsWith("meta.llama2")) {
      prompt = mapChatMessagesToMetaLlama2Messages(messages);
    } else {
      throw new Error(`Meta model ${metadata.model} is not supported`);
    }

    return {
      modelId: metadata.model,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        prompt,
        images: images.length ? images : undefined,
        max_gen_len: metadata.maxTokens,
        temperature: metadata.temperature,
        top_p: metadata.topP,
      }),
    };
  }
}
