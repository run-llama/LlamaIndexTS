import {
  Document,
  HuggingFaceEmbedding,
  MetadataReplacementPostProcessor,
  SentenceWindowNodeParser,
  Settings,
  VectorStoreIndex,
} from "llamaindex";

import essay from "./essay";

// Update node parser and embed model
Settings.nodeParser = new SentenceWindowNodeParser({
  windowSize: 3,
  windowMetadataKey: "window",
  originalTextMetadataKey: "original_text",
});
Settings.embedModel = new HuggingFaceEmbedding();

async function main() {
  const document = new Document({ text: essay, id_: "essay" });

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document], {
    logProgress: true,
  });

  // Query the index
  const queryEngine = index.asQueryEngine({
    nodePostprocessors: [new MetadataReplacementPostProcessor("window")],
  });

  const response = await queryEngine.query({
    query: "What did the author do in college?",
  });

  // Output response
  console.log(response.toString());
}

main().catch(console.error);
