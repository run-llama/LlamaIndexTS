import { extractText } from "@llamaindex/core/utils";
import {
  getResponseSynthesizer,
  OpenAI,
  Settings,
  VectorStoreIndex,
} from "llamaindex";
import { getStorageContext } from "./storage";

// Update chunk size and overlap
Settings.chunkSize = 512;
Settings.chunkOverlap = 20;

// Update llm
Settings.llm = new OpenAI({ model: "gpt-4-turbo", maxTokens: 512 });

// Update callbackManager
Settings.callbackManager.on("retrieve-end", (event) => {
  const { nodes, query } = event.detail;
  const text = extractText(query);
  console.log(`Retrieved ${nodes.length} nodes for query: ${text}`);
});

async function main() {
  const storageContext = await getStorageContext();
  const index = await VectorStoreIndex.init({
    nodes: [],
    storageContext,
  });

  const queryEngine = index.asQueryEngine({
    responseSynthesizer: getResponseSynthesizer("multi_modal"),
    retriever: index.asRetriever({ topK: { TEXT: 3, IMAGE: 1 } }),
  });
  const stream = await queryEngine.query(
    {
      query: "Tell me more about Vincent van Gogh's famous paintings",
    },
    true,
  );
  for await (const chunk of stream) {
    process.stdout.write(chunk.response);
  }
  process.stdout.write("\n");
}

main().catch(console.error);
