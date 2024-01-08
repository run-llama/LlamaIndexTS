import {
  Document,
  HuggingFaceEmbedding,
  MetadataReplacementPostProcessor,
  SentenceWindowNodeParser,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";
import essay from "./essay";

async function main() {
  const document = new Document({ text: essay, id_: "essay" });

  // create service context with sentence window parser
  // and local embedding from HuggingFace
  const nodeParser = new SentenceWindowNodeParser({
    windowSize: 3,
    windowMetadataKey: "window",
    originalTextMetadataKey: "original_text",
  });
  const embedModel = new HuggingFaceEmbedding();
  const serviceContext = serviceContextFromDefaults({ nodeParser, embedModel });

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document], {
    serviceContext,
    logProgress: true,
  });

  // Query the index
  const queryEngine = index.asQueryEngine({
    nodePostprocessors: [new MetadataReplacementPostProcessor("window")],
  });
  const response = await queryEngine.query(
    "What did the author do in college?",
  );

  // Output response
  console.log(response.toString());
}

main().catch(console.error);
