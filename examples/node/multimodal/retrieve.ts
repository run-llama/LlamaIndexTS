import { ImageNode, Settings, TextNode, VectorStoreIndex } from "llamaindex";
import { getStorageContext } from "./storage";

// Update chunk size and overlap
Settings.chunkSize = 512;
Settings.chunkOverlap = 20;

async function main() {
  // retrieve documents using the index
  const storageContext = await getStorageContext();
  const index = await VectorStoreIndex.init({
    nodes: [],
    storageContext,
  });
  const retriever = index.asRetriever({ topK: { TEXT: 1, IMAGE: 3 } });
  const results = await retriever.retrieve({
    query: "what are Vincent van Gogh's famous paintings",
  });
  for (const result of results) {
    const node = result.node;
    if (!node) {
      continue;
    }
    if (node instanceof ImageNode) {
      console.log(`Image: ${node.getUrl()}`);
    } else if (node instanceof TextNode) {
      console.log("Text:", (node as TextNode).text.substring(0, 128));
    }
    console.log(`ID: ${node.id_}`);
    console.log(`Similarity: ${result.score}\n`);
  }
}

main().catch(console.error);
