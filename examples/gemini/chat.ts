import { Gemini, GEMINI_MODEL } from "@llamaindex/google";
import fs from "fs";

(async () => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Please set the GOOGLE_API_KEY environment variable.");
  }
  const gemini = new Gemini({
    model: GEMINI_MODEL.GEMINI_PRO_1_5,
  });
  const result = await gemini.chat({
    messages: [
      { content: "You want to talk in rhymes.", role: "system" },
      {
        content:
          "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
        role: "user",
      },
    ],
  });
  console.log(result);

  // chat with file
  const resultWithFile = await gemini.chat({
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
            data: Uint8Array.from(fs.readFileSync("./data/manga.pdf")),
            mimeType: "application/pdf",
          },
        ],
      },
    ],
  });

  console.log(resultWithFile);
})();
