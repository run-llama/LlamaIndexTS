import { OpenAI } from "@llamaindex/openai";

(async () => {
  const llm = new OpenAI({ model: "o1-preview", temperature: 1 });

  const prompt = `What are three compounds we should consider investigating to advance research 
  into new antibiotics? Why should we consider them?
  `;

  // complete api
  const response = await llm.complete({ prompt });
  console.log(response.text);
})();
