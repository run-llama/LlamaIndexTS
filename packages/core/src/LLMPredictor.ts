import { ALL_AVAILABLE_MODELS, OpenAI } from "./LLM";
import { SimplePrompt } from "./Prompt";
import { CallbackManager, Event } from "./callbacks/CallbackManager";

/**
 * LLM Predictors are an abstraction to predict the response to a prompt.
 */
export interface BaseLLMPredictor {
  getLlmMetadata(): Promise<any>;
  predict(
    prompt: string | SimplePrompt,
    input?: Record<string, string>,
    parentEvent?: Event
  ): Promise<string>;
}

/**
 * ChatGPTLLMPredictor is a predictor that uses GPT.
 */
export class ChatGPTLLMPredictor implements BaseLLMPredictor {
  model: keyof typeof ALL_AVAILABLE_MODELS;
  retryOnThrottling: boolean;
  languageModel: OpenAI;
  callbackManager?: CallbackManager;

  constructor(props?: Partial<ChatGPTLLMPredictor>) {
    const {
      model = "gpt-3.5-turbo",
      retryOnThrottling = true,
      callbackManager,
      languageModel,
    } = props || {};
    this.model = model;
    this.callbackManager = callbackManager;
    this.retryOnThrottling = retryOnThrottling;

    this.languageModel =
      languageModel ??
      new OpenAI({
        model: this.model,
        callbackManager: this.callbackManager,
      });
  }

  async getLlmMetadata() {
    throw new Error("Not implemented yet");
  }

  async predict(
    prompt: string | SimplePrompt,
    input?: Record<string, string>,
    parentEvent?: Event,
    logProgress: boolean = false
  ): Promise<string> {
    if (typeof prompt === "string") {
      if (logProgress) {
        console.log("PROMPT", prompt);
      }
      const result = await this.languageModel.complete(prompt, parentEvent);
      return result.message.content;
    } else {
      return this.predict(prompt(input ?? {}), undefined, parentEvent);
    }
  }
}
