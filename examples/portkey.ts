import { Portkey } from "llamaindex";

(async () => {
  const portkey = new Portkey({
    mode: "single",
    llms: [
      {
        provider: "anyscale",
        virtual_key: "anyscale-3b3c04",
        model: "meta-llama/Llama-2-13b-chat-hf",
        max_tokens: 2000,
      },
    ],
  });
  const result = await portkey.chat({
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Tell me a joke." },
    ],
    stream: true,
  });
  for await (const res of result) {
    process.stdout.write(res.delta);
  }
})();
