import { VLLM } from "llamaindex";

const llm = new VLLM({
  model: "NousResearch/Meta-Llama-3-8B-Instruct",
});

const response = await llm.chat({
  messages: [
    {
      role: "user",
      content: "Hello?",
    },
  ],
});

console.log(response.message.content);
