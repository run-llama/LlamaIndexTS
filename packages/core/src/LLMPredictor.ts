import { ChatOpenAI } from "./LanguageModel";

export interface BaseLLMPredictor {
  getLlmMetadata(): Promise<any>;
  apredict(prompt: string, options: any): Promise<string>;
  // stream(prompt: string, options: any): Promise<any>;
}

export class ChatGPTLLMPredictor implements BaseLLMPredictor {
  llm: string;
  retryOnThrottling: boolean;
  languageModel: ChatOpenAI;

  constructor(
    llm: string = "gpt-3.5-turbo",
    retryOnThrottling: boolean = true
  ) {
    this.llm = llm;
    this.retryOnThrottling = retryOnThrottling;

    this.languageModel = new ChatOpenAI(this.llm);
  }

  async getLlmMetadata() {
    throw new Error("Not implemented yet");
  }

  async apredict(prompt: string, options: any) {
    return this.languageModel.agenerate([
      {
        content: prompt,
        type: "human",
      },
    ]);
  }

  // async stream(prompt: string, options: any) {
  //   console.log("stream");
  // }
}
