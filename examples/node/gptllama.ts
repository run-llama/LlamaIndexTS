import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import { ChatMessage, LlamaDeuce, OpenAI } from "llamaindex";

(async () => {
  const gpt4 = new OpenAI({ model: "gpt-4", temperature: 0.9 });
  const l2 = new LlamaDeuce({
    model: "Llama-2-70b-chat-4bit",
    temperature: 0.9,
  });

  const rl = readline.createInterface({ input, output });
  const start = await rl.question("Start: ");
  const history: ChatMessage[] = [
    {
      content:
        "Prefer shorter answers. Keep your response to 100 words or less.",
      role: "system",
    },
    { content: start, role: "user" },
  ];

  while (true) {
    const next = history.length % 2 === 1 ? gpt4 : l2;
    const r = await next.chat({
      messages: history.map(({ content, role }) => ({
        content,
        role: next === l2 ? role : role === "user" ? "assistant" : "user",
      })),
    });
    history.push({
      content: r.message.content,
      role: next === l2 ? "assistant" : "user",
    });
    await rl.question((next === l2 ? "Llama: " : "GPT: ") + r.message.content);
  }
})();
