import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import { OpenAI } from "@llamaindex/openai";
import { createMemory, Settings, SimpleChatEngine } from "llamaindex";

if (process.env.NODE_ENV === "development") {
  Settings.callbackManager.on("llm-end", (event) => {
    console.log("callers chain", event.reason?.computedCallers);
  });
}

async function main() {
  const llm = new OpenAI({ model: "gpt-3.5-turbo" });
  const chatHistory = createMemory([
    {
      content: "You are a helpful assistant.",
      role: "system",
    },
  ]);
  const chatEngine = new SimpleChatEngine({ llm });
  const rl = readline.createInterface({ input, output });

  while (true) {
    const query = await rl.question("Query: ");
    const stream = await chatEngine.chat({
      message: query,
      chatHistory,
      stream: true,
    });
    for await (const chunk of stream) {
      process.stdout.write(chunk.response);
    }
    console.log();
  }
}

main().catch(console.error);
