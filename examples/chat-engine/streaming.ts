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
    (async () => {
      const startTime1 = Date.now();
      const stream1 = await chatEngine1.chat({ message: query, stream: true });
      const timeToGetFirstChunk1 = Date.now() - startTime1;
      process.stdout.write(
        `Time to get first chunk from SimpleChatEngine: ${timeToGetFirstChunk1}ms\n`,
      );
      process.stdout.write("Assistant with SimpleChatEngine: ");
      for await (const chunk of stream1) {
        process.stdout.write(chunk.response);
      }
      process.stdout.write("\n");
    })();

    // show the response from the LLMAgent
    (async () => {
      const startTime2 = Date.now();
      const stream2 = await chatEngine2.chat({ message: query, stream: true });
      const timeToGetFirstChunk2 = Date.now() - startTime2;
      process.stdout.write(
        `Time to get first chunk from LLMAgent: ${timeToGetFirstChunk2}ms\n`,
      );
      process.stdout.write("Assistant with LLMAgent: ");
      for await (const chunk of stream2) {
        process.stdout.write(chunk.response);
      }
      process.stdout.write("\n");
    })();
  }
})();
