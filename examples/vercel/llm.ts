import { openai } from "@ai-sdk/openai";
import { wiki } from "@llamaindex/tools";
import { VercelLLM } from "@llamaindex/vercel";
import { LLMAgent } from "llamaindex";

async function main() {
  // Create an instance of VercelLLM with the OpenAI model
  const vercelLLM = new VercelLLM({ model: openai("gpt-4o") });

  console.log("\n=== Test 1: Using complete() for single response ===");
  const result = await vercelLLM.complete({
    prompt: "What is the capital of France?",
    stream: false, // Set to true if you want streaming responses
  });
  console.log(result.text);

  console.log("\n=== Test 2: Using chat() for streaming response ===");
  const stream = await vercelLLM.chat({
    messages: [
      { content: "You want to talk in rhymes.", role: "system" },
      {
        content:
          "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
        role: "user",
      },
    ],
    stream: true,
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.delta);
  }

  console.log("\n=== Test 3: Using LLMAgent with WikipediaTool ===");
  const agent = new LLMAgent({
    llm: vercelLLM,
    tools: [wiki()],
  });

  const { message } = await agent.chat({
    message: "What's the history of New York from Wikipedia in 3 sentences?",
  });

  console.log(message);
}

main().catch(console.error);
