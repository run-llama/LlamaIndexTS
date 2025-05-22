import { openaiResponses } from "@llamaindex/openai";

async function main() {
  const llm = openaiResponses({
    model: "gpt-4.1",
    builtInTools: [
      {
        type: "code_interpreter",
        container: { type: "auto" },
      },
    ],
  });

  const response = await llm.chat({
    messages: [
      {
        role: "system",
        content:
          "You are a personal math tutor. When asked a math question, write and run code to answer the question.",
      },
      {
        role: "user",
        content: "I need to solve the equation 3x + 11 = 14. Can you help me?",
      },
    ],
  });

  console.log(response.message.content);
}

main().catch(console.error);
