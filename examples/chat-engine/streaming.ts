import { LLMAgent, SimpleChatEngine } from "llamaindex";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

const chatEngine1 = new SimpleChatEngine();
const chatEngine2 = new LLMAgent({ tools: [] });

(async () => {
  const rl = readline.createInterface({ input, output });

  while (true) {
    const query = await rl.question("User: ");

    // show the response from the simple chat engine
    const stream1 = await chatEngine1.chat({ message: query, stream: true });
    process.stdout.write("Assistant with SimpleChatEngine: ");
    for await (const chunk of stream1) {
      process.stdout.write(chunk.response);
    }
    process.stdout.write("\n");

    // show the response from the LLMAgent
    const stream2 = await chatEngine2.chat({ message: query, stream: true });
    process.stdout.write("Assistant with LLMAgent: ");
    for await (const chunk of stream2) {
      process.stdout.write(chunk.response);
    }
    process.stdout.write("\n");
  }
})();
