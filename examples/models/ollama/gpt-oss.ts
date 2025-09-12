import { ollama } from "@llamaindex/ollama";

(async () => {
  const llm = ollama({
    model: "gpt-oss:20b",
  });
  const response = await llm.complete({ prompt: "How are you?" });
  console.log("Response:", response.text);
})();
