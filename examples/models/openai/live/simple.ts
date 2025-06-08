import { openai } from "@llamaindex/openai";
import { liveEvents } from "llamaindex";
import { saveWavFile } from "./util";

async function main() {
  const llm = openai({
    model: "gpt-4o-realtime-preview-2025-06-03",
  });

  const session = await llm.live.connect();
  const audioChunks: Buffer[] = [];

  setTimeout(async () => {
    if (audioChunks.length > 0) {
      await saveWavFile(audioChunks, "gemini-response.wav");
    }
    await session.disconnect();
  }, 10000);

  for await (const event of session.streamEvents()) {
    if (liveEvents.open.include(event)) {
      session.sendMessage({
        content: "Say something about you for 10 seconds",
        role: "user",
      });
    } else if (
      liveEvents.audio.include(event) &&
      typeof event.data === "string"
    ) {
      const chunk = Buffer.from(event.data, "base64");
      audioChunks.push(chunk);
      console.log(`Received audio chunk: ${chunk.length} bytes`);
    }
  }
}

main().catch(console.error);
