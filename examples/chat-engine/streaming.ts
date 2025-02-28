import { LLMAgent } from "llamaindex";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

const agent = new LLMAgent({ tools: [] });

(async () => {
  const rl = readline.createInterface({ input, output });

  while (true) {
    const query = await rl.question("User: ");

    const startTime = Date.now();
    const stream = await agent.chat({ message: query, stream: true });
    const timeToGetFirstChunk = Date.now() - startTime;
    process.stdout.write(
      `Time to get first chunk from LLMAgent: ${timeToGetFirstChunk}ms\n`,
    );
    process.stdout.write("Assistant with LLMAgent: ");
    for await (const chunk of stream) {
      process.stdout.write(chunk.response);
    }
    process.stdout.write("\n");
  }
})();
