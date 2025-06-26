import { gemini, GEMINI_MODEL } from "@llamaindex/google";
import fs from "fs";
import { tool } from "llamaindex";
import { z } from "zod";

(async () => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Please set the GOOGLE_API_KEY environment variable.");
  }
  const llm = gemini({ model: GEMINI_MODEL.GEMINI_2_0_FLASH });

  // normal chat
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
  console.log("\n normal chat: \n", result);

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
  console.log("\n chat with file: \n", resultWithFile);

  // chat with tool
  const resultWithTool = await llm.chat({
    messages: [
      {
        content: "What's the weather in Tokyo?",
        role: "user",
      },
    ],
    tools: [
      tool({
        name: "weather",
        description: "Get the weather",
        parameters: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
        execute: ({ location }) => {
          console.log("weather", location);
          return `The weather in ${location} is sunny and hot`;
        },
      }),
    ],
  });
  console.log("\n chat with tool: \n", resultWithTool.message.options); // should have toolCall
})();
