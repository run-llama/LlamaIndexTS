import { gemini, GEMINI_MODEL } from "@llamaindex/google";
import { ModalityType, tool } from "llamaindex";

import { liveEvents } from "llamaindex";
import { z } from "zod";

const weatherTool = tool({
  name: "weather",
  description: "Get the weather",
  parameters: z.object({
    location: z.string().describe("The location to get the weather for"),
  }),
  execute: ({ location }) => {
    return `The weather in ${location} is rainy`;
  },
});

const divideNumbers = tool({
  name: "divideNumbers",
  description: "Use this function to divide two numbers",
  parameters: z.object({
    a: z.number().describe("The dividend a to divide"),
    b: z.number().describe("The divisor b to divide by"),
  }),
  execute: ({ a, b }) => `${a / b}`,
});

async function main() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error(
      "Please set GOOGLE_API_KEY in your environment variables or .env file",
    );
    process.exit(1);
  }

  console.log("🚀 Initializing Gemini Live API with tools example...");

  const llm = gemini({
    apiKey: apiKey,
    model: GEMINI_MODEL.GEMINI_2_0_FLASH_LIVE, // Must use a live-compatible model
  });

  console.log("📡 Connecting to Gemini Live session...");

  // Connect to a live session with tools
  const session = await llm.live.connect({
    // Specify response modalities (text response is required for tools)
    responseModality: [ModalityType.TEXT],
    // Register our tools with the session
    tools: [weatherTool, divideNumbers],
    // Optional system instruction
    systemInstruction:
      "You are a helpful assistant that can use tools. When answering questions about weather or divide numbers, always use the appropriate tool.",
  });

  (async () => {
    console.log("🎧 Listening for events...");

    for await (const event of session.streamEvents()) {
      if (liveEvents.open.include(event)) {
        console.log("✅ Connected to Gemini Live session");

        console.log(
          "💬 Sending message: 'What's the weather in San Francisco and what is 100 / 2?'",
        );
        session.sendMessage({
          content: "What's the weather in San Francisco and what is 100 / 2?",
          role: "user",
        });
      } else if (liveEvents.text.include(event)) {
        process.stdout.write(event.text);
      } else if (liveEvents.error.include(event)) {
        console.error("❌ Error:", event.error);
      } else if (liveEvents.close.include(event)) {
        console.log("👋 Session closed");
        process.exit(0);
      } else if (liveEvents.setupComplete.include(event)) {
        console.log("🔧 Setup complete");
      }
    }
  })();

  process.on("SIGINT", async () => {
    console.log("\n👋 Interrupted by user. Closing session...");
    await session.disconnect();
    process.exit(0);
  });

  // Timeout after 2 minutes if no interaction
  setTimeout(async () => {
    console.log("\n⏱️ Session timeout. Closing session...");
    await session.disconnect();
    process.exit(0);
  }, 120000);
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
