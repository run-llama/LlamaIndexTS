import { createChatEngine } from "@/app/api/chat/engine";
import { ChatMessage, OpenAI } from "llamaindex";
import { Eval } from "braintrust";
import {LevenshteinScorer} from "autoevals";
 
Eval("Create-llama", {
  data: () => {
    return [
      {
        input: "Respond with: Hello World!",
        expected: "Hello World!",
      },
    ]; // Replace with your eval dataset
  },
  task: async (input: string) => {
    const llm = new OpenAI({
        model: "gpt-3.5-turbo",
      });
    const chatEngine = await createChatEngine(llm);
    const response = await chatEngine.chat(input, []);
    const result: ChatMessage = {
      role: "assistant",
      content: response.response,
    };
    return result.content;
  },
  scores: [LevenshteinScorer],
});
