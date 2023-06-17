import {
  CreateCompletionRequest,
  OpenAIApi,
  CreateCompletionResponse,
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
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
}

export * from "openai";
