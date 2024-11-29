import { openai } from "@ai-sdk/openai";
import { llamaindex } from "@llamaindex/vercel";
import { streamText } from "ai";
import { Document, VectorStoreIndex } from "llamaindex";
import fs from "node:fs/promises";

async function main() {
  const path = "node_modules/llamaindex/examples/abramov.txt";
  const essay = await fs.readFile(path, "utf-8");
  const document = new Document({ text: essay, id_: path });

  const index = await VectorStoreIndex.fromDocuments([document]);
  const queryTool = llamaindex({
    index,
    description: "Search through the documents", // optional description
  });
  console.log("Successfully created index and queryTool");

  streamText({
    tools: { queryTool },
    prompt: "Cost of moving cat from Russia to UK?",
    model: openai("gpt-4o"),
    onFinish({ response }) {
      console.log("Response:", JSON.stringify(response.messages, null, 2));
    },
  }).toDataStream();
}

main().catch(console.error);
