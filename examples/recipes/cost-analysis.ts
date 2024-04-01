import { encodingForModel } from "js-tiktoken";
import { OpenAI } from "llamaindex";
import { Settings } from "llamaindex/Settings";

const encoding = encodingForModel("gpt-4-0125-preview");

const llm = new OpenAI({
  model: "gpt-4-0125-preview",
});

let tokenCount = 0;

Settings.callbackManager.on("llm-start", (event) => {
  const { messages } = event.detail.payload;
  tokenCount += messages.reduce((count, message) => {
    return count + encoding.encode(message.content).length;
  }, 0);
  console.log("Token count:", tokenCount);
  // https://openai.com/pricing
  // $10.00 / 1M tokens
  console.log(`Price: $${(tokenCount / 1_000_000) * 10}`);
});
Settings.callbackManager.on("llm-end", (event) => {
  const { response } = event.detail.payload;
  tokenCount += encoding.encode(response.message.content).length;
  console.log("Token count:", tokenCount);
  // https://openai.com/pricing
  // $30.00 / 1M tokens
  console.log(`Price: $${(tokenCount / 1_000_000) * 30}`);
});

const question = "Hello, how are you?";
console.log("Question:", question);
llm
  .chat({
    stream: true,
    messages: [
      {
        content: question,
        role: "user",
      },
    ],
  })
  .then(async (iter) => {
    console.log("Response:");
    for await (const chunk of iter) {
      process.stdout.write(chunk.delta);
    }
  });
