import fs from "node:fs/promises";

function createWavHeader(
  sampleRate = 22050,
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

export async function saveWavFile(
  audioChunks: Buffer[],
  filePath: string,
  sampleRate = 22050,
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
