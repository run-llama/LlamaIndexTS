import { OpenAI } from "llamaindex";
import { Settings } from "llamaindex/Settings";

const llm = new OpenAI({
  model: "gpt-4-0125-preview",
});

let tokenCount = 0;

Settings.callbackManager.addHandlers("llm-start", (event) => {
  const { messages } = event.detail.payload;
  tokenCount += llm.tokens(messages);
  console.log("Token count:", tokenCount);
  // https://openai.com/pricing
  // $10.00 / 1M tokens
  console.log(`Price: $${(tokenCount / 1000000) * 10}`);
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
