import { openaiResponses } from "@llamaindex/openai";
import fs from "fs";
import { MessageContentDetail } from "llamaindex";

async function main() {
  const llm = openaiResponses({
    model: "gpt-4.1-mini",
    builtInTools: [{ type: "image_generation" }],
  });

  const response = await llm.chat({
    messages: [
      {
        role: "user",
        content:
          "Generate an image of a cute tiny llama wearing a hat playing with a cat on a meadow",
      },
    ],
  });
  const content = response.message.content as MessageContentDetail[];

  // This call returns a message with two parts, an image and a text part, get both parts
  const imagePart = content.find((part) => part.type === "image");
  const textPart = content.find((part) => part.type === "text");

  // write the image to a file
  fs.writeFileSync(
    "llama.png",
    Buffer.from(imagePart?.data as string, "base64"),
  );
  // and print out the text part
  console.log(textPart?.text);

  const imageId = response.message.options?.image_id;
  if (imageId) {
    console.log("Image ID for multi-turn generation:", imageId);
    console.log("Use this image_id in subsequent requests to modify the image");
  }
}

main().catch(console.error);
