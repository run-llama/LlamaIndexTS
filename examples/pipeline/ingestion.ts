import fs from "node:fs/promises";

import {
  Document,
  IngestionPipeline,
  MetadataMode,
  OpenAIEmbedding,
  SentenceSplitter,
} from "llamaindex";

async function main() {
  // Load essay from abramov.txt in Node
  const path = "node_modules/llamaindex/examples/abramov.txt";

  const essay = await fs.readFile(path, "utf-8");

  // Create Document object with essay
  const document = new Document({ text: essay, id_: path });
  const pipeline = new IngestionPipeline({
    transformations: [
      new SentenceSplitter({ chunkSize: 1024, chunkOverlap: 20 }),
      new OpenAIEmbedding(),
    ],
  });

  // run the pipeline
  const nodes = await pipeline.run({ documents: [document] });

  // print out the result of the pipeline run
  for (const node of nodes) {
    console.log(node.getContent(MetadataMode.NONE));
  }
}

main().catch(console.error);
