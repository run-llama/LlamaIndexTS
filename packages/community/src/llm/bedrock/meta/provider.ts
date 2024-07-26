import type {
  InvokeModelCommandInput,
  InvokeModelWithResponseStreamCommandInput,
} from "@aws-sdk/client-bedrock-runtime";
import type { BaseTool, ChatMessage, LLMMetadata } from "@llamaindex/core/llms";
import { toUtf8 } from "../utils";
import type { MetaNoneStreamingResponse, MetaStreamEvent } from "./types";

import { Provider } from "../provider";
import {
  mapChatMessagesToMetaLlama2Messages,
  mapChatMessagesToMetaLlama3Messages,
} from "./utils";

export class MetaProvider extends Provider<MetaStreamEvent> {
  constructor() {
    super();
  }

  getResultFromResponse(
    response: Record<string, any>,
  ): MetaNoneStreamingResponse {
    return JSON.parse(toUtf8(response.body));
  }

  getToolsFromResponse(_response: Record<string, any>): never {
    throw new Error("Not supported by this provider.");
  }

  getTextFromResponse(response: Record<string, any>): string {
    const result = this.getResultFromResponse(response);
    return result.generation;
  }

  getTextFromStreamResponse(response: Record<string, any>): string {
    const event = this.getStreamingEventResponse(response);
    if (event?.generation) {
      return event.generation;
    }
    return "";
  }

  getRequestBody<T extends ChatMessage>(
    metadata: LLMMetadata,
    messages: T[],
    tools?: BaseTool[],
  ): InvokeModelCommandInput | InvokeModelWithResponseStreamCommandInput {
    let prompt: string = "";
    if (metadata.model.startsWith("meta.llama3")) {
      prompt = mapChatMessagesToMetaLlama3Messages(messages, tools);
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
        max_gen_len: metadata.maxTokens,
        temperature: metadata.temperature,
        top_p: metadata.topP,
      }),
    };
  }
}
