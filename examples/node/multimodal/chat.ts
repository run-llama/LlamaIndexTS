// call pnpm tsx multimodal/load.ts first to init the storage
import { OpenAI, Settings, SimpleChatEngine, imageToDataUrl } from "llamaindex";
import fs from "node:fs/promises";

import path from "path";
// Update llm
Settings.llm = new OpenAI({ model: "gpt-4o-mini", maxTokens: 512 });

async function main() {
  const chatEngine = new SimpleChatEngine();

  // Load the image and convert it to a data URL
  const imagePath = path.join(__dirname, ".", "data", "60.jpg");

  // 1. you can read the buffer from the file
  const imageBuffer = await fs.readFile(imagePath);
  const dataUrl = await imageToDataUrl(imageBuffer);
  // or 2. you can just pass the file path to the imageToDataUrl function
  // const dataUrl = await imageToDataUrl(imagePath);

  // Update the image_url in the chat message
  const response = await chatEngine.chat({
    message: [
      {
        type: "text",
        text: "What is in this image?",
      },
      {
        type: "image_url",
        image_url: {
          url: dataUrl,
        },
      },
    ],
  });

  console.log(response.message.content);
}

main().catch(console.error);
