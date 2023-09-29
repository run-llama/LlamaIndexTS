import * as tiktoken from "tiktoken-node";
import { ChatMessage, OpenAI } from "../packages/core/src/llm/LLM";
import {SimpleChatEngine } from "../packages/core/src/ChatEngine";

async function main() {
  const query: string = `
Where is Istanbul?
  `;

  const llm = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0.1 });
  const message: ChatMessage = { content: query, role: "user" };

  var accumulated_result: string = "";
  var total_tokens: number = 0;

  //Callback stuff, like logging token usage.
  //GPT 3.5 Turbo uses CL100K_Base encodings, check your LLM to see which tokenizer it uses.
  const encoding = tiktoken.getEncoding("cl100k_base");

  //Stream Complete
  //Note: Setting streaming flag to true or false will auto-set your return type to
  //either an AsyncGenerator or a Response.
  // Omitting the streaming flag automatically sets streaming to false

  // const stream2 = await llm.chat([message], undefined);
  const stream = await llm.complete(query, undefined, true);

  for await (const part of stream) {
    //This only gives you the string part of a stream
    console.log(part);
    accumulated_result += part;
  }

  const correct_total_tokens: number =
    encoding.encode(accumulated_result).length;

  console.log(accumulated_result);
  //Check if our stream token counter works
  console.log(
    `Output token total using tokenizer on accumulated output: ${correct_total_tokens}`,
  );


  accumulated_result = "";
  const chatEngine: SimpleChatEngine = new SimpleChatEngine();
  const chatStream = await chatEngine.chat(query, undefined, true);
    for await (const part of chatStream){
      console.log(part);
      accumulated_result += part;
    }

  console.log(accumulated_result);
}

main();
