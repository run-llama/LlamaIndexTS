import { LLM, ChatMessage, ChatResponse } from "./LLM";
import Bard from "bard-ai";

/**
 * BardAI LLM implementation
 */
export class BardAI implements LLM {
  bard: Bard;

  constructor() {
    this.bard = new Bard();
  }

  async chat(
    messages: ChatMessage[],
    parentEvent?: Event
  ): Promise<ChatResponse> {
    const input = messages.map((message) => message.content).join("\n");
    const output = await this.bard.generate(input);
    return { message: { content: output, role: "assistant" } };
  }

  async complete(
    prompt: string,
    parentEvent?: Event
  ): Promise<CompletionResponse> {
    const output = await this.bard.generate(prompt);
    return { message: { content: output, role: "assistant" } };
  }
}