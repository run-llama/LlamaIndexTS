import {
  CreateCompletionRequest,
  OpenAIApi,
  CreateCompletionResponse,
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
  CreateEmbeddingRequest,
  CreateEmbeddingResponse,
  CreateModerationRequest,
  CreateModerationResponse,
  CreateEditRequest,
  CreateEditResponse,
  Configuration,
} from "openai";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import fetchAdapter from "./fetchAdapter";

export class OpenAIWrapper extends OpenAIApi {
  createCompletion(
    createCompletionRequest: CreateCompletionRequest,
    options?: AxiosRequestConfig
  ): Promise<AxiosResponse<CreateCompletionResponse, any>> {
    return super.createCompletion(createCompletionRequest, {
      adapter: fetchAdapter,
      ...options,
    });
  }

  createChatCompletion(
    createChatCompletionRequest: CreateChatCompletionRequest,
    options?: AxiosRequestConfig<any> | undefined
  ): Promise<AxiosResponse<CreateChatCompletionResponse, any>> {
    return super.createChatCompletion(createChatCompletionRequest, {
      adapter: fetchAdapter,
      ...options,
    });
  }

  createEmbedding(
    createEmbeddingRequest: CreateEmbeddingRequest,
    options?: AxiosRequestConfig<any> | undefined
  ): Promise<AxiosResponse<CreateEmbeddingResponse, any>> {
    return super.createEmbedding(createEmbeddingRequest, {
      adapter: fetchAdapter,
      ...options,
    });
  }

  createModeration(
    createModerationRequest: CreateModerationRequest,
    options?: AxiosRequestConfig<any> | undefined
  ): Promise<AxiosResponse<CreateModerationResponse, any>> {
    return super.createModeration(createModerationRequest, {
      adapter: fetchAdapter,
      ...options,
    });
  }

  createEdit(
    createEditRequest: CreateEditRequest,
    options?: AxiosRequestConfig<any> | undefined
  ): Promise<AxiosResponse<CreateEditResponse, any>> {
    return super.createEdit(createEditRequest, {
      adapter: fetchAdapter,
      ...options,
    });
  }
}

export class OpenAISession {
  openAIKey: string | null = null;
  openai: OpenAIWrapper;

  constructor(openAIKey: string | null = null) {
    if (openAIKey) {
      this.openAIKey = openAIKey;
    } else if (process.env.OPENAI_API_KEY) {
      this.openAIKey = process.env.OPENAI_API_KEY;
    } else {
      throw new Error("Set OpenAI Key in OPENAI_API_KEY env variable");
    }

    const configuration = new Configuration({
      apiKey: this.openAIKey,
    });

    this.openai = new OpenAIWrapper(configuration);
  }
}

let defaultOpenAISession: OpenAISession | null = null;

export function getOpenAISession(openAIKey: string | null = null) {
  if (!defaultOpenAISession) {
    defaultOpenAISession = new OpenAISession(openAIKey);
  }

  return defaultOpenAISession;
}

export * from "openai";
