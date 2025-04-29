import { Gemini, GEMINI_MODEL } from "@llamaindex/google";
import fs from "fs";

async function main() {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Please set the GOOGLE_API_KEY environment variable.");
  }

  const gemini = new Gemini({
    model: GEMINI_MODEL.GEMINI_2_0_FLASH,
  });

  const result = await gemini.chat({
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
