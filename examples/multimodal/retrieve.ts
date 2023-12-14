import {
  ImageNode,
  serviceContextFromDefaults,
  storageContextFromDefaults,
  TextNode,
  VectorStoreIndex,
} from "llamaindex";
import * as path from "path";

export async function createIndex() {
  // set up vector store index with two vector stores, one for text, the other for images
  const serviceContext = serviceContextFromDefaults({
    chunkSize: 512,
    chunkOverlap: 20,
  });
  const storageContext = await storageContextFromDefaults({
    persistDir: "storage",
    storeImages: true,
  });
  return await VectorStoreIndex.init({
    nodes: [],
    storageContext,
    serviceContext,
  });
}

async function main() {
  // retrieve documents using the index
  const index = await createIndex();
  const retriever = index.asRetriever({ similarityTopK: 3 });
  const results = await retriever.retrieve(
    "what are Vincent van Gogh's famous paintings",
  );
  for (const result of results) {
    const node = result.node;
    if (!node) {
      continue;
    }
    if (node instanceof ImageNode) {
      console.log(`Image: ${path.join(__dirname, node.id_)}`);
    } else if (node instanceof TextNode) {
      console.log("Text:", (node as TextNode).text.substring(0, 128));
    }
    console.log(`ID: ${node.id_}`);
    console.log(`Similarity: ${result.score}`);
  }
}

main().catch(console.error);
