import { fs } from "@llamaindex/env";
import { gemini, GEMINI_MODEL, liveEvents } from "@llamaindex/google";

async function main() {
  // Check for API key
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error(
      "Please set GOOGLE_API_KEY in your environment variables or .env file",
    );
    process.exit(1);
  }

  console.log("🚀 Initializing Gemini Live API example...");

  // Initialize the Gemini provider
  const llm = gemini({
    model: GEMINI_MODEL.GEMINI_2_0_FLASH_LIVE,
  });

  console.log("📡 Connecting to Gemini Live session...");

  // Connect to a live session
  const session = await llm.live.connect({
    responseModality: ["text"],
  });

  // Flag to track if we're still running
  let isRunning = true;

  // Process stream events
  (async () => {
    try {
      console.log("🎧 Listening for events...");

      for await (const event of session.streamEvents()) {
        if (liveEvents.open.include(event)) {
          console.log("✅ Connected to Gemini Live session"); // Send an initial message
          console.log(
            "💬 Sending message: 'Hello! Tell me about real-time AI applications.'",
          );
          session.sendMessage({
            content: "Hello! Tell me about real-time AI applications.",
            role: "user",
          });
        } else if (liveEvents.setupComplete.include(event)) {
          console.log("✅ Setup complete");
        } else if (liveEvents.text.include(event)) {
          // Output the text content
          process.stdout.write(event.content);
        } else if (liveEvents.audio.include(event)) {
          // Log when audio is received
          console.log(
            "\n🔊 Received audio data: ",
            event.delta.slice(0, 20) + "...",
          );

          // Optional: Save audio to a file
          const audioBuffer = Buffer.from(event.delta, "base64");
          await fs.writeFile("gemini-response.webm", audioBuffer);
          console.log("💾 Saved audio response to gemini-response.webm");
        } else if (liveEvents.error.include(event)) {
          console.error("❌ Error:", event.error);
        } else if (liveEvents.close.include(event)) {
          console.log("👋 Session closed");
          isRunning = false;
          break;
        }
      }
    } catch (error) {
      console.error("❌ Error processing stream:", error);
    }
  })();

  // Set a timeout to close the session after 60 seconds
  setTimeout(async () => {
    console.log("\n⏱️ Time's up! Closing session...");
    await session.disconnect();
    isRunning = false;
  }, 60000);

  // Listen for CTRL+C to gracefully close
  process.on("SIGINT", async () => {
    console.log("\n👋 Interrupted by user. Closing session...");
    await session.disconnect();
    isRunning = false;
  });
  const waitForClose = () => {
    if (isRunning) {
      setTimeout(waitForClose, 1000);
    } else {
      process.exit(0);
    }
  };
  waitForClose();
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
