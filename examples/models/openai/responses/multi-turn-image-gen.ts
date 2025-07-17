import { openaiResponses } from "@llamaindex/openai";
import fs from "fs";
import { MessageContentDetail } from "llamaindex";

async function main() {
  const llm = openaiResponses({
    model: "gpt-4.1-mini",
    builtInTools: [{ type: "image_generation" }],
  });

  // First turn: Generate initial image
  console.log("=== First Turn: Generate initial image ===");
  const firstResponse = await llm.chat({
    messages: [
      {
        role: "user",
        content:
          "Generate an image of a cute tiny llama wearing a hat playing with a cat on a meadow",
      },
    ],
  });

  const firstContent = firstResponse.message.content as MessageContentDetail[];
  const firstImagePart = firstContent.find((part) => part.type === "image");
  const firstTextPart = firstContent.find((part) => part.type === "text");

  // Save the first image
  if (firstImagePart?.data) {
    fs.writeFileSync(
      "llama-initial.png",
      Buffer.from(firstImagePart.data as string, "base64"),
    );
    console.log("First image saved as 'llama-initial.png'");
  }

  if (firstTextPart?.text) {
    console.log("First response:", firstTextPart.text);
  }

  // Get the image_id from the response options for multi-turn
  const imageId = firstResponse.message.options?.image_id;
  console.log("Image ID for multi-turn:", imageId);

  if (imageId) {
    // Second turn: Modify the image using the image_id
    console.log("\n=== Second Turn: Modify the image ===");
    const secondResponse = await llm.chat({
      messages: [
        {
          role: "user",
          content:
            "Generate an image of a cute tiny llama wearing a hat playing with a cat on a meadow",
        },
        {
          role: "assistant",
          content: firstContent,
          options: { image_id: imageId },
        },
        {
          role: "user",
          content:
            "Now add a rainbow in the background and make the llama's hat blue",
        },
      ],
    });

    const secondContent = secondResponse.message
      .content as MessageContentDetail[];
    const secondImagePart = secondContent.find((part) => part.type === "image");
    const secondTextPart = secondContent.find((part) => part.type === "text");

    // Save the modified image
    if (secondImagePart?.data) {
      fs.writeFileSync(
        "llama-modified.png",
        Buffer.from(secondImagePart.data as string, "base64"),
      );
      console.log("Modified image saved as 'llama-modified.png'");
    }

    if (secondTextPart?.text) {
      console.log("Second response:", secondTextPart.text);
    }
  } else {
    console.log("No image_id received, cannot perform multi-turn generation");
  }
}

main().catch(console.error);
