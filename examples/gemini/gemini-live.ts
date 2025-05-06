import { fs } from "@llamaindex/env";
import {
  gemini,
  GEMINI_MODEL,
  GeminiLive,
  liveEvents,
} from "@llamaindex/google";
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

  // Connect to a live session with both text and audio
  const session = await llm.live.connect({
    responseModality: ["audio"],
    voiceName: "Zephyr",
  });

  // Flag to track if we're still running
  let isRunning = true;

  // Initialize array to collect audio chunks
  const audioChunks: Buffer[] = [];
  let audioResponse = false;

  // Process stream events
  (async () => {
    try {
      console.log("🎧 Listening for events...");

      for await (const event of session.streamEvents()) {
        if (liveEvents.open.include(event)) {
          console.log("✅ Connected to Gemini Live session");

          // First send a text message
          console.log(
            "💬 Sending text message: 'Say something about you for 10 seconds'",
          );
          session.sendMessage({
            content: "Say something about you for 10 seconds",
            role: "user",
          });

          // Wait a bit before sending audio
          setTimeout(() => {
            sendPcmAudioFile(session);
          }, 3000);
        } else if (liveEvents.setupComplete.include(event)) {
          console.log("✅ Setup complete");
        } else if (liveEvents.text.include(event)) {
          // Output the text content
          process.stdout.write(event.content);
        } else if (liveEvents.audio.include(event)) {
          // Log when audio is received
          console.log("\n🔊 Received audio chunk");
          audioResponse = true;

          try {
            // Decode base64 audio chunk and collect it
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

          // If we received audio data, save it now that we have all chunks
          if (audioResponse && audioChunks.length > 0) {
            try {
              // Combine all audio chunks
              const combinedAudioData = Buffer.concat(audioChunks);
              console.log(
                `Total audio data: ${combinedAudioData.length} bytes`,
              );

              // Create WAV file with proper headers
              const wavHeader = createWavHeader(
                16000,
                16,
                1,
                combinedAudioData.length,
              );
              const wavFile = Buffer.concat([wavHeader, combinedAudioData]);

              await fs.writeFile("gemini-response.wav", wavFile);
              console.log(
                "💾 Saved complete audio response to gemini-response.wav",
              );
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

  // Function to read and send PCM audio file
  async function sendPcmAudioFile(session: GeminiLive) {
    try {
      console.log("🎤 Reading PCM audio file...");

      const filePath = path.join(__dirname, "hello_are_you_there.pcm");
      console.log(`Reading file from: ${filePath}`);

      // Read the file as a buffer
      const audioBuffer = await fs.readFile(filePath);

      // Convert buffer to base64
      const base64Audio = audioBuffer.toString("base64");

      // Send to Gemini API
      session.sendMessage({
        content: {
          type: "audio",
          data: base64Audio,
          mimeType: "audio/pcm;rate=16000",
        },
        role: "user",
      });

      console.log("🎤 PCM audio file sent! Waiting for response...");
    } catch (error) {
      console.error("❌ Error sending audio file:", error);
    }
  }

  // Set a timeout to close the session after 60 seconds
  setTimeout(async () => {
    console.log("\n⏱️ Time's up! Closing session...");

    // If we received audio data but session timed out, save what we have
    if (audioResponse && audioChunks.length > 0) {
      try {
        // Combine all audio chunks
        const combinedAudioData = Buffer.concat(audioChunks);
        console.log(`Total audio data: ${combinedAudioData.length} bytes`);

        // Create WAV file with proper headers
        const wavHeader = createWavHeader(
          16000,
          16,
          1,
          combinedAudioData.length,
        );
        const wavFile = Buffer.concat([wavHeader, combinedAudioData]);

        await fs.writeFile("gemini-response.wav", wavFile);
        console.log("💾 Saved complete audio response to gemini-response.wav");
      } catch (error) {
        console.error("❌ Error saving final audio file:", error);
      }
    }

    await session.disconnect();
    isRunning = false;
  }, 60000);

  // Listen for CTRL+C to gracefully close
  process.on("SIGINT", async () => {
    console.log("\n👋 Interrupted by user. Closing session...");

    // If we received audio data but user interrupted, save what we have
    if (audioResponse && audioChunks.length > 0) {
      try {
        // Combine all audio chunks
        const combinedAudioData = Buffer.concat(audioChunks);
        console.log(`Total audio data: ${combinedAudioData.length} bytes`);

        // Create WAV file with proper headers
        const wavHeader = createWavHeader(
          16000,
          16,
          1,
          combinedAudioData.length,
        );
        const wavFile = Buffer.concat([wavHeader, combinedAudioData]);

        await fs.writeFile("gemini-response.wav", wavFile);
        console.log("💾 Saved complete audio response to gemini-response.wav");
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
