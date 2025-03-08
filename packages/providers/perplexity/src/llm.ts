import { wrapEventCaller, wrapLLMEvent } from "@llamaindex/core/decorator";
import {
  BaseLLM,
  type ChatResponse,
  type ChatResponseChunk,
  type LLMChatParamsNonStreaming,
  type LLMChatParamsStreaming,
} from "@llamaindex/core/llms";

import { getEnv } from "@llamaindex/env";
import { Tokenizers } from "@llamaindex/env/tokenizers";
import { OpenAI } from "@llamaindex/openai";
import { OpenAI as OpenAIClient } from "openai";

export const PERPLEXITY_MODELS = {
  "sonar-deep-research": {
    contextWindow: 128000,
  },
  "sonar-reasoning-pro": {
    contextWindow: 128000,
  },
  "sonar-reasoning": {
    contextWindow: 128000,
  },
  "sonar-pro": {
    contextWindow: 200000,
  },
  sonar: {
    contextWindow: 128000,
  },
  "r1-1776": {
    contextWindow: 128000,
  },
};

type PerplexityModelName = keyof typeof PERPLEXITY_MODELS;

export interface PerplexityConfig {
  apiKey: string;
  model: PerplexityModelName;
  temperature?: number;
  topP?: number;
}

export class Perplexity extends BaseLLM {
  private apiKey: string;
  private model: PerplexityModelName;
  private client: OpenAIClient;
  private baseUrl: string = "https://api.perplexity.ai/";
  private temperature: number;
  private topP: number;
  constructor(init: PerplexityConfig) {
    super();
    this.model = init.model;
    this.apiKey = init.apiKey ?? getEnv("PERPLEXITY_API_KEY");
    this.temperature = init.temperature ?? 0.1;
    this.topP = init.topP ?? 1;
    if (!this.apiKey) {
      throw new Error("Perplexity API key is required");
    }

    this.client = new OpenAIClient({
      apiKey: this.apiKey,
      baseURL: this.baseUrl,
    });
  }

  get supportToolCall() {
    return false;
  }

  get metadata() {
    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP,
      contextWindow:
        PERPLEXITY_MODELS[this.model as keyof typeof PERPLEXITY_MODELS]
          ?.contextWindow ?? 4096,
      tokenizer: Tokenizers.CL100K_BASE,
    };
  }

  chat(
    params: LLMChatParamsStreaming<object, object>,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  chat(
    params: LLMChatParamsNonStreaming<object, object>,
  ): Promise<ChatResponse<object>>;
  @wrapEventCaller
  @wrapLLMEvent
  async chat(
    params: LLMChatParamsStreaming | LLMChatParamsNonStreaming,
  ): Promise<AsyncIterable<ChatResponseChunk> | ChatResponse<object>> {
    const messages = OpenAI.toOpenAIMessage(params.messages);
    if (params.stream) {
      return this.streamChat(params);
    }

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: this.temperature,
      stream: false,
    });

    return {
      raw: response,
      message: {
        content: response.choices[0]!.message.content ?? "",
        role: response.choices[0]!.message.role,
      },
    };
  }

  @wrapEventCaller
  protected async *streamChat(
    params: LLMChatParamsStreaming,
  ): AsyncIterable<ChatResponseChunk> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: OpenAI.toOpenAIMessage(params.messages),
      temperature: this.temperature,
      stream: true,
    });

    for await (const part of stream) {
      if (part.choices.length === 0) {
        continue;
      }

      if (part.choices[0]!.delta.content && !part.choices[0]!.finish_reason) {
        yield {
          raw: part,
          delta: part.choices[0]!.delta.content ?? "",
        };
      }
    }
  }
}
