import { gemini, GEMINI_MODEL } from "@llamaindex/google";
import fs from "fs";

(async () => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Please set the GOOGLE_API_KEY environment variable.");
  }
  const llm = gemini({ model: GEMINI_MODEL.GEMINI_2_0_FLASH });
  const result = await llm.chat({
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
  const resultWithFile = await llm.chat({
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
            data: fs.readFileSync("./data/manga.pdf").toString("base64"),
            mimeType: "application/pdf",
          },
        ],
      },
    ],
  });

  console.log(resultWithFile);
})();
