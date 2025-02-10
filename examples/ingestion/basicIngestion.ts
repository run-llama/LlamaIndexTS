import { OpenAIEmbedding } from "@llamaindex/openai";
import {
  Document,
  IngestionPipeline,
  SentenceSplitter,
  VectorStoreIndex,
} from "llamaindex";
import fs from "node:fs/promises";

async function main() {
  // Load essay from abramov.txt in Node
  const path = "../node_modules/llamaindex/examples/abramov.txt";

  const essay = await fs.readFile(path, "utf-8");

  // Create Document object with essay
  const document = new Document({ text: essay, id_: path });
  const pipeline = new IngestionPipeline({
    transformations: [
      new SentenceSplitter({ chunkSize: 1024, chunkOverlap: 20 }),
      new OpenAIEmbedding(),
    ],
  });
  console.time("Pipeline Run Time");

  const nodes = await pipeline.run({ documents: [document] });

  console.timeEnd("Pipeline Run Time");

  // initialize the VectorStoreIndex from nodes
  const index = await VectorStoreIndex.init({ nodes });

  // Query the index
  const queryEngine = index.asQueryEngine();

  const { message } = await queryEngine.query({
    query: "summarize the article in three sentence",
  });

  console.log(message);
}

main().catch(console.error);
