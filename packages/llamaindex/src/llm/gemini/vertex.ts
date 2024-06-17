import {
  VertexAI,
  GenerativeModel as VertexGenerativeModel,
  GenerativeModelPreview as VertexGenerativeModelPreview,
  type GenerateContentResponse,
  type ModelParams as VertexModelParams,
  type StreamGenerateContentResult as VertexStreamGenerateContentResult,
} from "@google-cloud/vertexai";

import type {
  GeminiChatStreamResponse,
  IGeminiSession,
  VertexGeminiSessionOptions,
} from "./types.js";

import { getEnv } from "@llamaindex/env";
import type { CompletionResponse } from "../types.js";
import { streamConverter } from "../utils.js";
import { getText } from "./utils.js";

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
    if (this.preview) return this.vertex.preview.getGenerativeModel(metadata);
    return this.vertex.getGenerativeModel(metadata);
  }

  getResponseText(response: GenerateContentResponse): string {
    return getText(response);
  }

  async *getChatStream(
    result: VertexStreamGenerateContentResult,
  ): GeminiChatStreamResponse {
    yield* streamConverter(result.stream, (response) => ({
      delta: this.getResponseText(response),
      raw: response,
    }));
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
