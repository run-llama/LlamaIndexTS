import {
  HfInference,
  type Options as HfInferenceOptions,
} from "@huggingface/inference";
import { ToolCallLLM } from "./base.js";
import type {
  ChatResponse,
  ChatResponseChunk,
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
  LLMMetadata,
  ToolCallLLMMessageOptions,
} from "./types.js";
import { streamConverter, wrapLLMEvent } from "./utils.js";

export type HFAdditionalChatOptions = {};
export type HFChatParamsStreaming = LLMChatParamsStreaming<
  HFAdditionalChatOptions,
  ToolCallLLMMessageOptions
>;
export type HFChatStreamResponse = AsyncIterable<
  ChatResponseChunk<ToolCallLLMMessageOptions>
>;
export type HFChatParamsNonStreaming = LLMChatParamsNonStreaming<
  HFAdditionalChatOptions,
  ToolCallLLMMessageOptions
>;
export type HFChatNonStreamResponse = ChatResponse<ToolCallLLMMessageOptions>;
const DEFAULT_PARAMS = {
  model: "microsoft/phi-2",
  temperature: 0.1,
  topP: 1,
  maxTokens: undefined,
  contextWindow: 3900,
};
export type HFConfig = Partial<typeof DEFAULT_PARAMS> &
  HfInferenceOptions & {
    accessToken: string;
    endpoint?: string;
  };

/**
    Wrapper on the Hugging Face's Inference API.
    API Docs: https://huggingface.co/docs/huggingface.js/inference/README
    List of tasks with models: huggingface.co/api/tasks 
    
    Note that Conversational API is not yet supported by the Inference API.
    They recommend using the text generation API instead.
    See: https://github.com/huggingface/huggingface.js/issues/586#issuecomment-2024059308
 */
export class HuggingFaceInferenceAPI extends ToolCallLLM<HFAdditionalChatOptions> {
  model: string;
  temperature: number;
  topP: number;
  maxTokens?: number;
  contextWindow: number;
  hf: HfInference;

  constructor(init: HFConfig) {
    super();
    const {
      model,
      temperature,
      topP,
      maxTokens,
      contextWindow,
      accessToken,
      endpoint,
      ...hfInferenceOpts
    } = init;
    this.hf = new HfInference(accessToken, hfInferenceOpts);
    this.model = model ?? DEFAULT_PARAMS.model;
    this.temperature = temperature ?? DEFAULT_PARAMS.temperature;
    this.topP = topP ?? DEFAULT_PARAMS.topP;
    this.maxTokens = maxTokens ?? DEFAULT_PARAMS.maxTokens;
    this.contextWindow = contextWindow ?? DEFAULT_PARAMS.contextWindow;
    if (endpoint) this.hf.endpoint(endpoint);
  }

  get supportToolCall(): boolean {
    return true;
  }

  get metadata(): LLMMetadata {
    return {
      model: this.model,
      temperature: this.temperature,
      topP: this.topP,
      maxTokens: this.maxTokens,
      contextWindow: this.contextWindow,
      tokenizer: undefined,
    };
  }

  chat(params: HFChatParamsStreaming): Promise<HFChatStreamResponse>;
  chat(params: HFChatParamsNonStreaming): Promise<HFChatNonStreamResponse>;
  @wrapLLMEvent
  async chat(
    params: HFChatParamsStreaming | HFChatParamsNonStreaming,
  ): Promise<HFChatNonStreamResponse | HFChatStreamResponse> {
    if (params.stream) return this.streamChat(params);
    return this.nonStreamChat(params);
  }

  protected async nonStreamChat(
    params: HFChatParamsNonStreaming,
  ): Promise<HFChatNonStreamResponse> {
    const lastMessage = params.messages[params.messages.length - 1];
    const res = await this.hf.textGeneration({
      model: this.model,
      inputs: lastMessage.content as string,
      parameters: this.metadata,
    });
    return {
      raw: res,
      message: {
        content: res.generated_text,
        role: "assistant",
      },
    };
  }

  protected async *streamChat(
    params: HFChatParamsStreaming,
  ): HFChatStreamResponse {
    const lastMessage = params.messages[params.messages.length - 1];
    const stream = this.hf.textGenerationStream({
      model: this.model,
      inputs: lastMessage.content as string,
      parameters: this.metadata,
    });
    yield* streamConverter(stream, (chunk) => ({
      delta: chunk.token.text,
      raw: chunk,
    }));
  }
}
