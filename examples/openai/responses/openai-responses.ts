import { openaiResponses } from "@llamaindex/openai";

async function main() {
  const llm = openaiResponses({
    model: "gpt-4o-mini",
    temperature: 0.1,
  });

  // Basic chat example
  const response = await llm.chat({
    messages: [
      {
        role: "user",
        content: "What is the capital of France?",
      },
    ],
  });

  console.log(response.message.content);
}

main().catch(console.error);
