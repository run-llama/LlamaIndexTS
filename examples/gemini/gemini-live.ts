import { ModalityType } from "@llamaindex/core/schema";
import { fs } from "@llamaindex/env";
import { gemini, GEMINI_MODEL, GeminiLiveSession } from "@llamaindex/google";
import { liveEvents } from "llamaindex";

import path from "path";

// Function to create WAV header
function createWavHeader(
  sampleRate = 16000,
  bitsPerSample = 16,
  channels = 1,
  dataLength: number,
) {
  const buffer = Buffer.alloc(44);

  // RIFF chunk descriptor
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4); // File size - 8
  buffer.write("WAVE", 8);

  // fmt sub-chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(channels, 22); // NumChannels
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE((sampleRate * channels * bitsPerSample) / 8, 28); // ByteRate
  buffer.writeUInt16LE((channels * bitsPerSample) / 8, 32); // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34); // BitsPerSample

  // data sub-chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40); // Subchunk2Size

  return buffer;
}

async function saveWavFile(
  audioChunks: Buffer[],
  filePath: string,
  sampleRate = 16000,
  bitsPerSample = 16,
  channels = 1,
): Promise<void> {
  if (audioChunks.length === 0) {
    throw new Error("No audio data to save");
  }

  try {
    const combinedAudioData = Buffer.concat(audioChunks);
    console.log(`Total audio data: ${combinedAudioData.length} bytes`);

    const wavHeader = createWavHeader(
      sampleRate,
      bitsPerSample,
      channels,
      combinedAudioData.length,
    );
    const wavFile = Buffer.concat([wavHeader, combinedAudioData]);

    await fs.writeFile(filePath, wavFile);
    console.log(`💾 Saved audio to ${filePath}`);
    return;
  } catch (error) {
    console.error("❌ Error saving audio file:", error);
    throw error;
  }
}

async function main() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error(
      "Please set GOOGLE_API_KEY in your environment variables or .env file",
    );
    process.exit(1);
  }

  console.log("🚀 Initializing Gemini Live API example...");

  const llm = gemini({
    model: GEMINI_MODEL.GEMINI_2_0_FLASH_LIVE,
    voiceName: "Zephyr",
  });

  console.log("📡 Connecting to Gemini Live session...");

  const session = await llm.live.connect({
    responseModality: [ModalityType.AUDIO],
  });

  let isRunning = true;

  const audioChunks: Buffer[] = [];
  let audioResponse = false;

  (async () => {
    try {
      console.log("🎧 Listening for events...");

      for await (const event of session.streamEvents()) {
        if (liveEvents.open.include(event)) {
          console.log("✅ Connected to Gemini Live session");

          console.log(
            "💬 Sending text message: 'Say something about you for 10 seconds'",
          );
          session.sendMessage({
            content: "Say something about you for 10 seconds",
            role: "user",
          });

          setTimeout(() => {
            sendPcmAudioFile(session);
          }, 3000);
        } else if (liveEvents.setupComplete.include(event)) {
          console.log("✅ Setup complete");
        } else if (liveEvents.text.include(event)) {
          process.stdout.write(event.content);
        } else if (liveEvents.audio.include(event)) {
          console.log("\n🔊 Received audio chunk");
          audioResponse = true;

          try {
            const chunk = Buffer.from(event.delta, "base64");
            audioChunks.push(chunk);
            console.log(`Received audio chunk: ${chunk.length} bytes`);
          } catch (error) {
            console.error("❌ Error processing audio chunk:", error);
          }
        } else if (liveEvents.error.include(event)) {
          console.error("❌ Error:", event.error);
        } else if (liveEvents.close.include(event)) {
          console.log("👋 Session closed");

          if (audioResponse && audioChunks.length > 0) {
            try {
              await saveWavFile(audioChunks, "gemini-response.wav");
            } catch (error) {
              console.error("❌ Error saving final audio file:", error);
            }
          }

          isRunning = false;
          break;
        }
      }
    } catch (error) {
      console.error("❌ Error processing stream:", error);
    }
  })();

  async function sendPcmAudioFile(session: GeminiLiveSession) {
    try {
      console.log("🎤 Reading PCM audio file...");

      const filePath = path.join(__dirname, "hello_are_you_there.pcm");
      console.log(`Reading file from: ${filePath}`);

      const audioBuffer = await fs.readFile(filePath);

      const base64Audio = audioBuffer.toString("base64");

      session.sendMessage({
        content: [
          {
            type: "audio",
            data: base64Audio,
            mimeType: "audio/pcm;rate=16000",
          },
        ],
        role: "user",
      });

      console.log("🎤 PCM audio file sent! Waiting for response...");
    } catch (error) {
      console.error("❌ Error sending audio file:", error);
    }
  }

  setTimeout(async () => {
    console.log("\n⏱️ Time's up! Closing session...");

    if (audioResponse && audioChunks.length > 0) {
      try {
        await saveWavFile(audioChunks, "gemini-response.wav");
      } catch (error) {
        console.error("❌ Error saving final audio file:", error);
      }
    }

    await session.disconnect();
    isRunning = false;
  }, 60000);

  process.on("SIGINT", async () => {
    console.log("\n👋 Interrupted by user. Closing session...");

    if (audioResponse && audioChunks.length > 0) {
      try {
        await saveWavFile(audioChunks, "gemini-response.wav");
      } catch (error) {
        console.error("❌ Error saving final audio file:", error);
      }
    }

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
