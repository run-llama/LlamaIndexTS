import { wrapLLMEvent } from "@llamaindex/core/decorator";
import { Settings } from "@llamaindex/core/global";
import "@llamaindex/core/llms";
import {
  BaseLLM,
  type ChatResponse,
  type ChatResponseChunk,
  type LLMChatParamsNonStreaming,
  type LLMChatParamsStreaming,
  type LLMMetadata,
} from "@llamaindex/core/llms";
import { loadTransformers } from "@llamaindex/env";
import type {
  PreTrainedModel,
  PreTrainedTokenizer,
  Tensor,
} from "@xenova/transformers";
import { DEFAULT_PARAMS } from "./shared";

const DEFAULT_HUGGINGFACE_MODEL = "stabilityai/stablelm-tuned-alpha-3b";

export interface HFLLMConfig {
  modelName?: string;
  tokenizerName?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  contextWindow?: number;
}

export class HuggingFaceLLM extends BaseLLM {
  modelName: string;
  tokenizerName: string;
  temperature: number;
  topP: number;
  maxTokens?: number | undefined;
  contextWindow: number;

  private tokenizer: PreTrainedTokenizer | null = null;
  private model: PreTrainedModel | null = null;

  constructor(init?: HFLLMConfig) {
    super();
    this.modelName = init?.modelName ?? DEFAULT_HUGGINGFACE_MODEL;
    this.tokenizerName = init?.tokenizerName ?? DEFAULT_HUGGINGFACE_MODEL;
    this.temperature = init?.temperature ?? DEFAULT_PARAMS.temperature;
    this.topP = init?.topP ?? DEFAULT_PARAMS.topP;
    this.maxTokens = init?.maxTokens ?? DEFAULT_PARAMS.maxTokens;
    this.contextWindow = init?.contextWindow ?? DEFAULT_PARAMS.contextWindow;
  }

  get metadata(): LLMMetadata {
    return {
      model: this.modelName,
      temperature: this.temperature,
      topP: this.topP,
      maxTokens: this.maxTokens,
      contextWindow: this.contextWindow,
      tokenizer: undefined,
    };
  }

  async getTokenizer() {
    const { AutoTokenizer } = await loadTransformers((transformer) => {
      Settings.callbackManager.dispatchEvent(
        "load-transformers",
        {
          transformer,
        },
        true,
      );
    });
    if (!this.tokenizer) {
      this.tokenizer = await AutoTokenizer.from_pretrained(this.tokenizerName);
    }
    return this.tokenizer;
  }

  async getModel() {
    const { AutoModelForCausalLM } = await loadTransformers((transformer) => {
      Settings.callbackManager.dispatchEvent(
        "load-transformers",
        {
          transformer,
        },
        true,
      );
    });
    if (!this.model) {
      this.model = await AutoModelForCausalLM.from_pretrained(this.modelName);
    }
    return this.model;
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

  protected async nonStreamChat(
    params: LLMChatParamsNonStreaming,
  ): Promise<ChatResponse> {
    const tokenizer = await this.getTokenizer();
    const model = await this.getModel();

    const messageInputs = params.messages.map((msg) => ({
      role: msg.role,
      content: msg.content as string,
    }));
    const inputs = tokenizer.apply_chat_template(messageInputs, {
      add_generation_prompt: true,
      ...this.metadata,
    }) as Tensor;

    // TODO: the input for model.generate should be updated when using @xenova/transformers v3
    // We should add `stopping_criteria` also when it's supported in v3
    // See: https://github.com/xenova/transformers.js/blob/3260640b192b3e06a10a1f4dc004b1254fdf1b80/src/models.js#L1248C9-L1248C27
    const outputs = await model.generate(inputs, this.metadata);
    const outputText = tokenizer.batch_decode(outputs, {
      skip_special_tokens: false,
    });

    return {
      raw: outputs,
      message: {
        content: outputText.join(""),
        role: "assistant",
      },
    };
  }

  protected async streamChat(params: LLMChatParamsStreaming): Promise<never> {
    // @xenova/transformers v2 doesn't support streaming generation yet
    // they are working on it in v3
    // See: https://github.com/xenova/transformers.js/blob/3260640b192b3e06a10a1f4dc004b1254fdf1b80/src/models.js#L1249
    throw new Error("Method not implemented.");
  }
}
