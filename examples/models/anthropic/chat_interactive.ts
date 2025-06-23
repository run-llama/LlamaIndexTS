import { Anthropic } from "@llamaindex/anthropic";
import { Memory, SimpleChatEngine } from "llamaindex";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

(async () => {
  const llm = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-3-7-sonnet",
  });
  // chatHistory will store all the messages in the conversation
  const chatHistory = Memory.fromChatMessages([
    {
      content: "You want to talk in rhymes.",
      role: "system",
    },
  ]);
  const chatEngine = new SimpleChatEngine({
    llm,
    memory: chatHistory,
  });
  const rl = readline.createInterface({ input, output });

  while (true) {
    const query = await rl.question("User: ");
    process.stdout.write("Assistant: ");
    const stream = await chatEngine.chat({ message: query, stream: true });
    for await (const chunk of stream) {
      process.stdout.write(chunk.response);
    }
    process.stdout.write("\n");
  }
})();
