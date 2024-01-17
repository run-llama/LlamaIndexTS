import fs from "node:fs/promises";

import {
  Document,
  HuggingFaceEmbedding,
  HuggingFaceEmbeddingModelType,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

async function main() {
  // Load essay from abramov.txt in Node
  const path = "node_modules/llamaindex/examples/abramov.txt";

  const essay = await fs.readFile(path, "utf-8");

  // Create Document object with essay
  const document = new Document({ text: essay, id_: path });

  // Use Local embedding from HuggingFace
  const embedModel = new HuggingFaceEmbedding({
    modelType: HuggingFaceEmbeddingModelType.XENOVA_ALL_MPNET_BASE_V2,
  });
  const serviceContext = serviceContextFromDefaults({
    embedModel,
  });

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document], {
    serviceContext,
  });

  // Query the index
  const queryEngine = index.asQueryEngine();
  const stream = await queryEngine.query({
    query: "What did the author do in college?",
    stream: true,
  });

  // Output response
  for await (const chunk of stream) {
    process.stdout.write(chunk.response);
  }
}

main().catch(console.error);
