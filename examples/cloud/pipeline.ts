import fs from "node:fs/promises";

import {
  Document,
  IngestionPipeline,
  OpenAIEmbedding,
  SimpleNodeParser,
} from "llamaindex";

async function main() {
  // Load essay from abramov.txt in Node
  const path = "node_modules/llamaindex/examples/abramov.txt";

  const essay = await fs.readFile(path, "utf-8");

  // Create Document object with essay
  const document = new Document({ text: essay, id_: path });
  const pipeline = new IngestionPipeline({
    name: "pipeline",
    transformations: [
      new SimpleNodeParser({ chunkSize: 1024, chunkOverlap: 20 }),
      new OpenAIEmbedding({ apiKey: "api-key" }),
    ],
  });

  const pipelineId = await pipeline.register({
    documents: [document],
    verbose: true,
  });

  console.log(`Pipeline with id ${pipelineId} successfully created.`);
}

main().catch(console.error);
