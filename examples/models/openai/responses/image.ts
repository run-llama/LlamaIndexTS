import { openaiResponses } from "@llamaindex/openai";

async function main() {
  const llm = openaiResponses({
    model: "gpt-4o",
    maxOutputTokens: 1000,
    apiKey: process.env.MY_OPENAI_API_KEY,
  });

  const response = await llm.chat({
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "What's in this image? Describe it in detail.",
          },
          {
            type: "image_url",
            image_url: {
              url: "https://storage.googleapis.com/cloud-samples-data/vision/face/faces.jpeg",
            },
          },
        ],
      },
    ],
  });

  console.log("Single Image Analysis:", response.message.content);
}

main().catch(console.error);
