import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import { ChatMessage, OpenAI, ReplicateLLM } from "llamaindex";

(async () => {
  const gpt4 = new OpenAI({ model: "gpt-4-turbo", temperature: 0.9 });
  const l3 = new ReplicateLLM({
    model: "llama-3-70b-instruct",
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
    const next = history.length % 2 === 1 ? gpt4 : l3;
    const r = await next.chat({
      messages: history.map(({ content, role }) => ({
        content,
        role: next === l3 ? role : role === "user" ? "assistant" : "user",
      })),
    });
    history.push({
      content: r.message.content,
      role: next === l3 ? "assistant" : "user",
    });
    await rl.question(
      (next === l3 ? "Llama 3: " : "GPT 4 Turbo: ") + r.message.content,
    );
  }
})();
