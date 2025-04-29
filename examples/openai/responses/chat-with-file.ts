import { openaiResponses } from "@llamaindex/openai";
import fs from "fs";

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Please set the OPENAI_API_KEY environment variable.");
  }

  const llm = openaiResponses({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const result = await llm.chat({
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

  console.log(result);
}

void main().catch(console.error);
