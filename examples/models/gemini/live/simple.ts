import { gemini, GEMINI_MODEL } from "@llamaindex/google";
import { liveEvents } from "llamaindex";
import { saveWavFile } from "./util";

async function main() {
  // Server-side (token creation):
  const serverllm = gemini({
    model: GEMINI_MODEL.GEMINI_2_0_FLASH_LIVE,
  });
  const ephemeralKey = await serverllm.live.getEphemeralKey();

  // Client-side (Live API connection):
  const llm = gemini({
    apiKey: ephemeralKey,
    model: GEMINI_MODEL.GEMINI_2_0_FLASH_LIVE,
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
    } else if (liveEvents.audio.include(event)) {
      const chunk = Buffer.from(event.data, "base64");
      audioChunks.push(chunk);
      console.log(`Received audio chunk: ${chunk.length} bytes`);
    }
  }
}

main().catch(console.error);
