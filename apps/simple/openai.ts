import { OpenAI } from "llamaindex";

(async () => {
  const llm = new OpenAI({ model: "gpt-3.5-turbo-1106", temperature: 0.1 });

  // complete api
  const response1 = await llm.complete("How are you?");
  console.log(response1.message.content);

  // chat api
  const response2 = await llm.chat([
    { content: "Tell me a joke!", role: "user" },
  ]);
  console.log(response2.message.content);
})();
