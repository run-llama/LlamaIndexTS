import { LlamaCloudIndex } from "llamaindex";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

async function main() {
  const index = new LlamaCloudIndex({
    name: "test",
    projectName: "default",
    apiKey: "llx-9xAW94gy4y2jj7iJhj0nlcYZvv0thTDDjkKgrjBW7LyO5Ygn",
    baseUrl: "http://0.0.0.0:8000",
  });
  const queryEngine = index.asQueryEngine();

  const rl = readline.createInterface({ input, output });

  while (true) {
    const query = await rl.question("Query: ");

    const resopnse = await queryEngine.query({
      query,
      // stream: true,
    });
    console.log({
      resopnse,
    });
  }
}

main().catch(console.error);
