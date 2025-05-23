import {
  GoogleGenerativeAI,
  GenerativeModel as GoogleGenerativeModel,
  type EnhancedGenerateContentResponse,
  type FunctionCall,
  type ModelParams as GoogleModelParams,
  type RequestOptions as GoogleRequestOptions, // Added for consistency if needed
  type GenerateContentStreamResult as GoogleStreamGenerateContentResult,
  type SafetySetting,
} from "@google/genai";

import type {
  GeminiChatStreamResponse,
  IGeminiSession,
  VertexGeminiSessionOptions,
} from "./types.js";

// ToolCall related imports are already here from @llamaindex/core/llms
import type {
  CompletionResponse,
  ToolCall,
  ToolCallLLMMessageOptions,
} from "@llamaindex/core/llms";
import { streamConverter } from "@llamaindex/core/utils";
import { getEnv, randomUUID } from "@llamaindex/env";
import { DEFAULT_SAFETY_SETTINGS } from "./utils.js"; // getText and getFunctionCalls might be replaced or inlined

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
  private gemini: GoogleGenerativeAI;
  private generativeModel: GoogleGenerativeModel;

  constructor(options?: VertexGeminiSessionOptions, modelParams?: GoogleModelParams, requestOpts?: GoogleRequestOptions) {
    const project = options?.project ?? getEnv("GOOGLE_VERTEX_PROJECT_ID") ?? getEnv("GOOGLE_VERTEX_PROJECT");
    const location = options?.location ?? getEnv("GOOGLE_VERTEX_LOCATION");
    if (!project || !location) {
      throw new Error(
        "Set Google Vertex project and location in GOOGLE_VERTEX_PROJECT_ID/GOOGLE_VERTEX_PROJECT and GOOGLE_VERTEX_LOCATION env variables",
      );
    }
    this.gemini = new GoogleGenerativeAI({
      vertexai: true,
      project,
      location,
      apiVersion: options?.apiVersion, // Pass apiVersion if provided
    });

    if (!modelParams || !modelParams.model) {
      throw new Error("Model parameters (modelParams) with a model name are required.");
    }

    this.generativeModel = this.gemini.getGenerativeModel(
      {
        safetySettings: modelParams.safetySettings ?? DEFAULT_SAFETY_SETTINGS,
        ...modelParams,
      },
      requestOpts,
    );
  }

  getGenerativeModel(
    _metadata?: GoogleModelParams, // No longer takes metadata here, it's part of constructor
    _requestOpts?: GoogleRequestOptions,
  ): GoogleGenerativeModel {
    return this.generativeModel;
  }

  getResponseText(response: EnhancedGenerateContentResponse): string {
    // Align with base.ts GeminiSession
    return response.text ?? "";
  }

  getToolsFromResponse(
    response: EnhancedGenerateContentResponse,
  ): ToolCall[] | undefined {
    // Align with base.ts GeminiSession
    const fc = response.functionCalls;
    if (fc) {
      return fc.map(
        (call: FunctionCall) =>
          ({
            name: call.name,
            input: call.args,
            id: randomUUID(),
          }) as ToolCall,
      );
    }
    return undefined;
  }

  async *getChatStream(
    result: GoogleStreamGenerateContentResult, // Use GoogleStreamGenerateContentResult from @google/genai
  ): GeminiChatStreamResponse {
    // Align with base.ts GeminiSession
    for await (const response of result.stream) {
      const tools = this.getToolsFromResponse(response);
      const options: ToolCallLLMMessageOptions = tools?.length
        ? { toolCall: tools }
        : {};
      yield {
        delta: this.getResponseText(response),
        raw: response,
        options,
      };
    }
  }

  async *getCompletionStream( // Changed to async generator and use GoogleStreamGenerateContentResult
    result: GoogleStreamGenerateContentResult,
  ): AsyncIterable<CompletionResponse> {
    // Align with base.ts GeminiSession
    for await (const response of result.stream) {
      yield {
        text: this.getResponseText(response),
        raw: response,
      };
    }
  }
}
