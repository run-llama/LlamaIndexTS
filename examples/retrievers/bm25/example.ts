import { Bm25Retriever } from "@llamaindex/bm25-retriever";
import { OpenAIEmbedding } from "@llamaindex/openai";
import { PDFReader } from "@llamaindex/readers/pdf";
import { MetadataMode, Settings, VectorStoreIndex } from "llamaindex";

Settings.embedModel = new OpenAIEmbedding();

async function main() {
  // Load PDF
  const reader = new PDFReader();
  const documents = await reader.loadData("./data/brk-2022.pdf");

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments(documents);

  const retriever = new Bm25Retriever({
    docStore: index.docStore,
    topK: 3,
  });

  // Query the data
  const response = await retriever.retrieve({
    query: "What mistakes did Warren E. Buffett make?",
  });

  // Output response
  response.forEach((r) => {
    console.log(`Score: ${r.score}`);
    console.log(`Text: ${r.node.getContent(MetadataMode.NONE)}`);
  });
}

main().catch(console.error);
