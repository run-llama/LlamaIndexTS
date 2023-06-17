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

export * from "openai";
