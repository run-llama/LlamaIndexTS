import { CallbackManager, Trace } from "./callbacks/CallbackManager";
import { aHandleOpenAIStream } from "./callbacks/utility/aHandleOpenAIStream";
import {
  ChatCompletionRequestMessageRoleEnum,
  CreateChatCompletionRequest,
  OpenAISession,
  getOpenAISession,
} from "./openai";

export interface BaseLanguageModel {}

type MessageType = "human" | "ai" | "system" | "generic" | "function";

export interface BaseMessage {
  content: string;
  type: MessageType;
}

interface Generation {
  text: string;
  generationInfo?: Record<string, any>;
}

export interface LLMResult {
  generations: Generation[][]; // Each input can have more than one generations
}

export class BaseChatModel implements BaseLanguageModel {}

export class ChatOpenAI extends BaseChatModel {
  model: string;
  temperature: number = 0.7;
  openAIKey: string | null = null;
  requestTimeout: number | null = null;
  maxRetries: number = 6;
  n: number = 1;
  maxTokens?: number;
  session: OpenAISession;
  callbackManager?: CallbackManager;

  constructor({
    model = "gpt-3.5-turbo",
    callbackManager,
  }: {
    model: string;
    callbackManager?: CallbackManager;
  }) {
    super();
    this.model = model;
    this.callbackManager = callbackManager;
    this.session = getOpenAISession();
  }

  static mapMessageType(
    type: MessageType
  ): ChatCompletionRequestMessageRoleEnum {
    switch (type) {
      case "human":
        return "user";
      case "ai":
        return "assistant";
      case "system":
        return "system";
      case "function":
        return "function";
      default:
        return "user";
    }
  }

  async agenerate(
    messages: BaseMessage[],
    parentTrace?: Trace
  ): Promise<LLMResult> {
    const baseRequestParams: CreateChatCompletionRequest = {
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      n: this.n,
      messages: messages.map((message) => ({
        role: ChatOpenAI.mapMessageType(message.type),
        content: message.content,
      })),
    };

    if (this.callbackManager?.onLLMStream) {
      const response = await this.session.openai.createChatCompletion(
        {
          ...baseRequestParams,
          stream: true,
        },
        { responseType: "stream" }
      );
      const fullResponse = await aHandleOpenAIStream({
        response,
        onLLMStream: this.callbackManager.onLLMStream,
        parentTrace,
      });
      return { generations: [[{ text: fullResponse }]] };
    }

    const response = await this.session.openai.createChatCompletion(
      baseRequestParams
    );

    const { data } = response;
    const content = data.choices[0].message?.content ?? "";
    return { generations: [[{ text: content }]] };
  }
}
