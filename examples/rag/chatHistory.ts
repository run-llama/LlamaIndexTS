import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import { OpenAI } from "@llamaindex/openai";
import {
  ChatSummaryMemoryBuffer,
  Settings,
  SimpleChatEngine,
} from "llamaindex";

if (process.env.NODE_ENV === "development") {
  Settings.callbackManager.on("llm-end", (event) => {
    console.log("callers chain", event.reason?.computedCallers);
  });
}

async function main() {
  // Set maxTokens to 75% of the context window size of 4096
  // This will trigger the summarizer once the chat history reaches 25% of the context window size (1024 tokens)
  const llm = new OpenAI({ model: "gpt-3.5-turbo", maxTokens: 4096 * 0.75 });
  const chatHistory = new ChatSummaryMemoryBuffer({ llm });
  const chatEngine = new SimpleChatEngine({ llm });
  const rl = readline.createInterface({ input, output });

  while (true) {
    const query = await rl.question("Query: ");
    const stream = await chatEngine.chat({
      message: query,
      chatHistory,
      stream: true,
    });
    if (chatHistory.getLastSummary()) {
      // Print the summary of the conversation so far that is produced by the SummaryChatHistory
      console.log(`Summary: ${chatHistory.getLastSummary()?.content}`);
    }
    for await (const chunk of stream) {
      process.stdout.write(chunk.response);
    }
    console.log();
  }
}

main().catch(console.error);
