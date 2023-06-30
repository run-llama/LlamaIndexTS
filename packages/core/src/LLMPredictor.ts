import { ChatOpenAI } from "./LanguageModel";
import { SimplePrompt } from "./Prompt";

export interface BaseLLMPredictor {
  getLlmMetadata(): Promise<any>;
  apredict(
    prompt: string | SimplePrompt,
    input?: Record<string, string>
  ): Promise<string>;
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

  async apredict(
    prompt: string | SimplePrompt,
    input?: Record<string, string>
  ): Promise<string> {
    if (typeof prompt === "string") {
      const result = await this.languageModel.agenerate([
        {
          content: prompt,
          type: "human",
        },
      ]);
      return result.generations[0][0].text;
    } else {
      return this.apredict(prompt(input ?? {}));
    }
  }

  // async stream(prompt: string, options: any) {
  //   console.log("stream");
  // }
}
