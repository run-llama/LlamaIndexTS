export interface BaseLLMPredictor {
  getLlmMetadata(): Promise<any>;
  predict(prompt: string, options: any): Promise<any>;
  stream(prompt: string, options: any): Promise<any>;
}

export class LLMPredictor implements BaseLLMPredictor {
  llm: string;
  retryOnThrottling: boolean;

  constructor(llm: string, retryOnThrottling: boolean = true) {
    this.llm = llm;
    this.retryOnThrottling = retryOnThrottling;
  }

  async getLlmMetadata() {
    console.log("getLlmMetadata");
  }

  async predict(prompt: string, options: any) {
    console.log("predict");
  }

  async stream(prompt: string, options: any) {
    console.log("stream");
  }
}
