interface LLMResult {}

interface BaseLanguageModel {}

type MessageType = "human" | "ai" | "system" | "chat";

interface BaseMessage {
  content: string;
  type: MessageType;
}

interface Generation {
  text: string;
  generationInfo?: { [key: string]: any };
}

interface LLMResult {
  generations: Generation[][]; // Each input can have more than one generations
}

class BaseChatModel implements BaseLanguageModel {}

class ChatOpenAI extends BaseChatModel {
  model: string = "gpt-3.5-turbo";
  temperature: number = 0.7;
  openAIKey: string | null = null;
  requestTimeout: number | null = null;
  maxRetries: number = 6;
  n: number = 1;
  maxTokens?: number;

  async agenerate(messages: BaseMessage[], stop: string[] | null = null) {
    return;
  }
}
