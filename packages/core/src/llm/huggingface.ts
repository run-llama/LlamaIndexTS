import {
  HfInference,
  type Options as HfInferenceOptions,
} from "@huggingface/inference";
import { BaseLLM } from "./base.js";
import type {
  ChatMessage,
  ChatResponse,
  ChatResponseChunk,
  LLMChatParamsNonStreaming,
  LLMChatParamsStreaming,
  LLMMetadata,
  ToolCallLLMMessageOptions,
} from "./types.js";
import { streamConverter, wrapLLMEvent } from "./utils.js";

const DEFAULT_PARAMS = {
  temperature: 0.1,
  topP: 1,
  maxTokens: undefined,
  contextWindow: 3900,
};
export type HFConfig = Partial<typeof DEFAULT_PARAMS> &
  HfInferenceOptions & {
    model: string;
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
export class HuggingFaceInferenceAPI extends BaseLLM {
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
    this.model = model;
    this.temperature = temperature ?? DEFAULT_PARAMS.temperature;
    this.topP = topP ?? DEFAULT_PARAMS.topP;
    this.maxTokens = maxTokens ?? DEFAULT_PARAMS.maxTokens;
    this.contextWindow = contextWindow ?? DEFAULT_PARAMS.contextWindow;
    if (endpoint) this.hf.endpoint(endpoint);
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

  chat(
    params: LLMChatParamsStreaming,
  ): Promise<AsyncIterable<ChatResponseChunk>>;
  chat(params: LLMChatParamsNonStreaming): Promise<ChatResponse>;
  @wrapLLMEvent
  async chat(
    params: LLMChatParamsStreaming | LLMChatParamsNonStreaming,
  ): Promise<AsyncIterable<ChatResponseChunk> | ChatResponse<object>> {
    if (params.stream) return this.streamChat(params);
    return this.nonStreamChat(params);
  }

  private messagesToPrompt(messages: ChatMessage<ToolCallLLMMessageOptions>[]) {
    let prompt = "";
    for (const message of messages) {
      if (message.role === "system") {
        prompt += `<|system|>\n${message.content}</s>\n`;
      } else if (message.role === "user") {
        prompt += `<|user|>\n${message.content}</s>\n`;
      } else if (message.role === "assistant") {
        prompt += `<|assistant|>\n${message.content}</s>\n`;
      }
    }
    // ensure we start with a system prompt, insert blank if needed
    if (!prompt.startsWith("<|system|>\n")) {
      prompt = "<|system|>\n</s>\n" + prompt;
    }
    // add final assistant prompt
    prompt = prompt + "<|assistant|>\n";
    return prompt;
  }

  protected async nonStreamChat(
    params: LLMChatParamsNonStreaming,
  ): Promise<ChatResponse> {
    const res = await this.hf.textGeneration({
      model: this.model,
      inputs: this.messagesToPrompt(params.messages),
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
    params: LLMChatParamsStreaming,
  ): AsyncIterable<ChatResponseChunk> {
    const stream = this.hf.textGenerationStream({
      model: this.model,
      inputs: this.messagesToPrompt(params.messages),
      parameters: this.metadata,
    });
    yield* streamConverter(stream, (chunk) => ({
      delta: chunk.token.text,
      raw: chunk,
    }));
  }
}
