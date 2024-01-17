import { OpenAI } from "llamaindex";

(async () => {
  const llm = new OpenAI({ model: "gpt-4-1106-preview", temperature: 0.1 });

  // complete api
  const response1 = await llm.complete({ prompt: "How are you?" });
  console.log(response1.text);

  // chat api
  const response2 = await llm.chat({
    messages: [{ content: "Tell me a joke.", role: "user" }],
  });
  console.log(response2.message.content);
})();
