import {
  ImageNode,
  serviceContextFromDefaults,
  SimpleDirectoryReader,
  SimpleVectorStore,
  TextNode,
  VectorStoreIndex,
} from "llamaindex";
import * as path from "path";

async function main() {
  // read data into documents
  const reader = new SimpleDirectoryReader();
  const documents = await reader.loadData({
    directoryPath: "data/multi_modal",
  });
  // set up vector store index with two vector stores, one for text, the other for images
  const serviceContext = serviceContextFromDefaults({ chunkSize: 512 });
  const vectorStore = await SimpleVectorStore.fromPersistDir("./storage/text");
  const imageVectorStore =
    await SimpleVectorStore.fromPersistDir("./storage/images");
  const index = await VectorStoreIndex.fromDocuments(documents, {
    serviceContext,
    imageVectorStore,
    vectorStore,
  });
  // retrieve documents using the index
  const retriever = index.asRetriever();
  retriever.similarityTopK = 3;
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
