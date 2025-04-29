import { Anthropic } from "@llamaindex/anthropic";
import fs from "fs";

// Note that: Anthropic only supports PDF files for now with limited models
// See: https://docs.anthropic.com/en/docs/build-with-claude/pdf-support?q=pdf#supported-platforms-and-models

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Please set the ANTHROPIC_API_KEY environment variable.");
  }

  const llm = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-3-5-sonnet-20240620",
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

  console.log(result.message);
}

void main().catch(console.error);
