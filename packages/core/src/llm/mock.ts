import {
  ChatMessage,
  ChatResponse,
  CompletionResponse,
  LLM,
  MessageType,
} from "./LLM";

//Mock LLM, it's empty.
//We can use it to test abstractions that use LLM responses in-memory
export default class MockLLM implements LLM {
  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    const msgType: MessageType = "user";
    const returnVal = {
      message: { content: "whatever", role: msgType },
    };
    return returnVal;
  }
  async complete(query: string): Promise<CompletionResponse> {
    const msgType: MessageType = "user";
    const returnVal = {
      message: { content: "whatever", role: msgType },
    };
    return returnVal;
  }
}
