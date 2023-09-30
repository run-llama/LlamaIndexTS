import {ChatMessage, OpenAI, Anthropic, SimpleChatEngine} from "llamaindex";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

async function main() {
  const query: string = `
Where is Istanbul?
  `;

  // const llm = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0.1 });
  const llm = new Anthropic();
  const message: ChatMessage = { content: query, role: "user" };

  var accumulated_result: string = "";
  var total_tokens: number = 0;

  //TODO: Add callbacks later

  //Stream Complete
  //Note: Setting streaming flag to true or false will auto-set your return type to
  //either an AsyncGenerator or a Response.
  // Omitting the streaming flag automatically sets streaming to false

  const chatEngine: SimpleChatEngine = new SimpleChatEngine();

  const rl = readline.createInterface({ input, output });
  while (true) {
    const query = await rl.question("Query: ");

    if (!query) {
      break;
    }

    //Case 1: .chat(query, undefined, true) => Stream
    //Case 2: .chat(query, undefined, false) => Response object
    //Case 3: .chat(query, undefined) => Response object
    const chatStream = await chatEngine.chat(query, undefined, true);
    for await (const part of chatStream){
      process.stdout.write(part);
      // accumulated_result += part;
    }
  }
}

main();
