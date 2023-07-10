import { OpenAI } from "./LLM";
import { SimplePrompt } from "./Prompt";

// TODO change this to LLM class
export interface BaseLLMPredictor {
  getLlmMetadata(): Promise<any>;
  apredict(
    prompt: string | SimplePrompt,
    input?: Record<string, string>
  ): Promise<string>;
  // stream(prompt: string, options: any): Promise<any>;
}

// TODO change this to LLM class
export class ChatGPTLLMPredictor implements BaseLLMPredictor {
  llm: string;
  retryOnThrottling: boolean;
  languageModel: OpenAI;

  constructor(
    llm: string = "gpt-3.5-turbo",
    retryOnThrottling: boolean = true
  ) {
    this.llm = llm;
    this.retryOnThrottling = retryOnThrottling;

    this.languageModel = new OpenAI(this.llm);
  }

  async getLlmMetadata() {
    throw new Error("Not implemented yet");
  }

  async apredict(
    prompt: string | SimplePrompt,
    input?: Record<string, string>
  ): Promise<string> {
    if (typeof prompt === "string") {
      const result = await this.languageModel.acomplete([
        {
          content: prompt,
          role: "user",
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
