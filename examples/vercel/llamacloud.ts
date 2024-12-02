import { openai } from "@ai-sdk/openai";
import { llamaindex } from "@llamaindex/vercel";
import { streamText } from "ai";
import { Document, LlamaCloudIndex } from "llamaindex";
import fs from "node:fs/promises";

async function main() {
  const path = "node_modules/llamaindex/examples/abramov.txt";
  const essay = await fs.readFile(path, "utf-8");
  const document = new Document({ text: essay, id_: path });

  const index = await LlamaCloudIndex.fromDocuments({
    documents: [document],
    name: "test-pipeline",
    projectName: "Default",
    apiKey: process.env.LLAMA_CLOUD_API_KEY,
  });
  console.log("Successfully created index");

  const result = streamText({
    model: openai("gpt-4o"),
    prompt: "Cost of moving cat from Russia to UK?",
    tools: {
      queryTool: llamaindex({
        index,
        description:
          "get information from your knowledge base to answer questions.", // optional description
      }),
    },
    maxSteps: 5,
  });

  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
