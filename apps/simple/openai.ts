import process from "node:process";
import { Configuration, OpenAIWrapper } from "@llamaindex/core/src/openai";

(async () => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIWrapper(configuration);

  const { data } = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages: [{ role: "user", content: "Hello, world!" }],
  });

  console.log(data);
  console.log(data.choices[0].message);
})();
