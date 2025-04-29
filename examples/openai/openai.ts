import { OpenAI, OpenAIEmbedding } from "@llamaindex/openai";
import fs from "fs";

(async () => {
  const llm = new OpenAI({ model: "gpt-4o" });

  // complete api
  const response1 = await llm.complete({ prompt: "How are you?" });
  console.log(response1.text);

  // chat api
  const response2 = await llm.chat({
    messages: [{ content: "Tell me a joke.", role: "user" }],
  });
  console.log(response2.message.content);

  // chat with file
  const response3 = await llm.chat({
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "What's in this document? Describe it in detail.",
          },
          {
            type: "file",
            data: fs.readFileSync("./data/manga.pdf"),
            mimeType: "application/pdf",
          },
        ],
      },
    ],
  });
  console.log(response3.message.content);

  // chat with image
  const response4 = await llm.chat({
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

  console.log("Single Image Analysis:", response4.message.content);

  // // embeddings
  const embedModel = new OpenAIEmbedding();
  const texts = ["hello", "world"];
  const embeddings = await embedModel.getTextEmbeddingsBatch(texts);
  console.log(`\nWe have ${embeddings.length} embeddings`);
})();
