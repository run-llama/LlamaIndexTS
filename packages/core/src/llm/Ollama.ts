import { LLM, ChatMessage, ChatResponse, Event } from "./LLM";
import { Tokenizers } from "../helpers/GlobalsHelper";
import { OllamaInstance } from "./OllamaInstance";

export class Ollama implements LLM {
  private ollama: OllamaInstance; // Add a private property to hold the Ollama instance

  constructor(ollamaInstance: OllamaInstance) {
    // Initialize Ollama instance
    this.ollama = ollamaInstance; // Initialize the Ollama instance with the provided OllamaInstance
  }

  async runModelLocally(model: string, options: Record<string, any>): Promise<string> {
    // Logic for running the model locally
    const result = await this.ollama.runModelLocally(model, options); // Run the model locally using the Ollama instance and return the result
    return result;
  }

  async complete<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : ChatResponse,
  >(
    prompt: string,
    parentEvent?: Event | undefined,
    streaming?: T,
  ): Promise<R> {
    return this.chat([{ content: prompt, role: "user" }], parentEvent, streaming);
  }

  async *streamEndpoint(model: string, prompt: string, options: Record<string, any>): AsyncGenerator<string, void, unknown> {
    // Logic for streaming the model's output
    yield "";
  }

  async chat<
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : ChatResponse,
  >(
    messages: ChatMessage[],
    parentEvent?: Event | undefined,
    streaming?: T,
  ): Promise<R> {
    return this.ollama.chat(messages, parentEvent, streaming);
  }
  
  // Removed duplicated complete method
    T extends boolean | undefined = undefined,
    R = T extends true ? AsyncGenerator<string, void, unknown> : ChatResponse,
  >(
    prompt: string,
    parentEvent?: Event | undefined,
    streaming?: T,
  ): Promise<R> {
    return this.chat([{ content: prompt, role: "user" }], parentEvent, streaming);
  }

  tokens(messages: ChatMessage[]): number {
    // Logic for calculating tokens
    let totalTokens = 0;
    for (const message of messages) {
      totalTokens += message.content.split(' ').length;
    }
    return totalTokens;
  }

  get metadata() {
    return {
      model: "OllamaModel",
      temperature: 0.1,
      topP: 0.9,
      maxTokens: 1000,
      contextWindow: 500,
      tokenizer: Tokenizers.CL100K_BASE, // Add tokenizer property
    };
  }
}
