import { openaiResponses } from "@llamaindex/openai";

async function main() {
  const llm = openaiResponses({
    model: "gpt-4o",
    temperature: 0.1,
    builtInTools: [{ type: "web_search_preview" }],
  });

  const response = await llm.chat({
    messages: [
      {
        role: "user",
        content: "What are the latest developments in AI?",
      },
    ],
  });

  console.log(response.message.content);
}

main().catch(console.error);
