import {
  type GenerateContentResponse,
  VertexAI,
  GenerativeModel as VertexGenerativeModel,
  GenerativeModelPreview as VertexGenerativeModelPreview,
  type ModelParams as VertexModelParams,
  type StreamGenerateContentResult as VertexStreamGenerateContentResult,
} from "@google-cloud/vertexai";

import type {
  GeminiChatStreamResponse,
  IGeminiSession,
  VertexGeminiSessionOptions,
} from "./types.js";

import type { FunctionCall } from "@google/generative-ai";
import type {
  CompletionResponse,
  ToolCall,
  ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import { streamConverter } from "@llamaindex/core/utils";
import { getEnv, randomUUID } from "@llamaindex/env";
import { DEFAULT_SAFETY_SETTINGS, getFunctionCalls, getText } from "./utils.js";

/* To use Google's Vertex AI backend, it doesn't use api key authentication.
 *
 * To authenticate for local development:
 *
 *     ```
 *     npm install @google-cloud/vertexai
 *     gcloud auth application-default login
 *     ```
 * For production the prefered method is via a service account, more
 * details: https://cloud.google.com/docs/authentication/
 *
 * */

export class GeminiVertexSession implements IGeminiSession {
  private vertex: VertexAI;
  private preview: boolean = false;

  constructor(options?: Partial<VertexGeminiSessionOptions>) {
    const project = options?.project ?? getEnv("GOOGLE_VERTEX_PROJECT");
    const location = options?.location ?? getEnv("GOOGLE_VERTEX_LOCATION");
    if (!project || !location) {
      throw new Error(
        "Set Google Vertex project and location in GOOGLE_VERTEX_PROJECT and GOOGLE_VERTEX_LOCATION env variables",
      );
    }
    this.vertex = new VertexAI({
      ...options,
      project,
      location,
    });
    this.preview = options?.preview ?? false;
  }

  getGenerativeModel(
    metadata: VertexModelParams,
  ): VertexGenerativeModelPreview | VertexGenerativeModel {
    if (this.preview) {
      return this.vertex.preview.getGenerativeModel({
        safetySettings: DEFAULT_SAFETY_SETTINGS,
        ...metadata,
      });
    }
    return this.vertex.getGenerativeModel({
      safetySettings: DEFAULT_SAFETY_SETTINGS,
      ...metadata,
    });
  }

  getResponseText(response: GenerateContentResponse): string {
    return getText(response);
  }

  getToolsFromResponse(
    response: GenerateContentResponse,
  ): ToolCall[] | undefined {
    return getFunctionCalls(response)?.map(
      (call: FunctionCall) =>
        ({
          name: call.name,
          input: call.args,
          id: randomUUID(),
        }) as ToolCall,
    );
  }

  async *getChatStream(
    result: VertexStreamGenerateContentResult,
  ): GeminiChatStreamResponse {
    yield* streamConverter(result.stream, (response) => {
      const tools = this.getToolsFromResponse(response);
      const options: ToolCallLLMMessageOptions = tools?.length
        ? { toolCall: tools }
        : {};
      return {
        delta: this.getResponseText(response),
        raw: response,
        options,
      };
    });
  }

  getCompletionStream(
    result: VertexStreamGenerateContentResult,
  ): AsyncIterable<CompletionResponse> {
    return streamConverter(result.stream, (response) => ({
      text: this.getResponseText(response),
      raw: response,
    }));
  }
}
