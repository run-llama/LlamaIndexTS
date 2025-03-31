import { openaiResponses } from "@llamaindex/openai";

async function main() {
  const llm = openaiResponses({
    model: "gpt-4o",
    maxOutputTokens: 1000,
  });

  const response = await llm.chat({
    messages: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: "What's in this image? Describe it in detail.",
          },
          {
            type: "input_image",
            image_url:
              "https://storage.googleapis.com/cloud-samples-data/vision/face/faces.jpeg",
          },
        ],
      },
    ],
  });

  console.log("Single Image Analysis:", response.message.content);
}

main().catch(console.error);
