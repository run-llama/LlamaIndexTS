import { stdin as input, stdout as output } from "node:process";
// readline/promises is still experimental so not in @types/node yet
// @ts-ignore
import readline from "node:readline/promises";

import { OpenAI, SimpleChatEngine, SummaryChatHistory } from "llamaindex";

async function main() {
  // Set maxTokens to 75% of the context window size of 4096
  // This will trigger the summarizer once the chat history reaches 25% of the context window size (1024 tokens)
  const llm = new OpenAI({ model: "gpt-3.5-turbo", maxTokens: 4096 * 0.75 });
  const chatHistory = new SummaryChatHistory({ llm });
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
