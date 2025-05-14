import { xai } from "@llamaindex/xai";

(async () => {
  // note: set XAI_API_KEY in your environment
  // you can also pass the API key in the constructor, for example:
  // const llm = xai({ apiKey: "YOUR_API_KEY" });
  const llm = xai({ model: "grok-3-latest" });

  // complete api
  const response1 = await llm.complete({ prompt: "How are you?" });
  console.log(response1.text);

  // chat api
  const response2 = await llm.chat({
    messages: [{ content: "Tell me a joke.", role: "user" }],
  });
  console.log(response2.message.content);
})();
