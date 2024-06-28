import type {
  InvokeModelCommandInput,
  InvokeModelWithResponseStreamCommandInput,
} from "@aws-sdk/client-bedrock-runtime";
import type { ChatMessage, LLMMetadata } from "llamaindex";
import type { MetaNoneStreamingResponse, MetaStreamingEvent } from "../types";
import {
  mapChatMessagesToMetaLlama2Messages,
  mapChatMessagesToMetaLlama3Messages,
  toUtf8,
} from "../utils";

import { Provider } from "../provider";

export class MetaProvider extends Provider<MetaStreamingEvent> {
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
  ): InvokeModelCommandInput | InvokeModelWithResponseStreamCommandInput {
    let promptFunction: (messages: ChatMessage[]) => string;

    if (metadata.model.startsWith("meta.llama3")) {
      promptFunction = mapChatMessagesToMetaLlama3Messages;
    } else if (metadata.model.startsWith("meta.llama2")) {
      promptFunction = mapChatMessagesToMetaLlama2Messages;
    } else {
      throw new Error(`Meta model ${metadata.model} is not supported`);
    }

    return {
      modelId: metadata.model,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        prompt: promptFunction(messages),
        max_gen_len: metadata.maxTokens,
        temperature: metadata.temperature,
        top_p: metadata.topP,
      }),
    };
  }
}
