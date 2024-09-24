import fs from "node:fs/promises";

import {
  Document,
  HuggingFaceInferenceAPI,
  HuggingFaceInferenceAPIEmbedding,
  Settings,
  VectorStoreIndex,
} from "llamaindex";

if (!process.env.HUGGING_FACE_TOKEN) {
  throw new Error("Please set the HUGGING_FACE_TOKEN environment variable.");
}

// Update embed model with HuggingFaceAPIEmbedding
Settings.embedModel = new HuggingFaceInferenceAPIEmbedding({
  model: "mixedbread-ai/mxbai-embed-large-v1",
  accessToken: process.env.HUGGING_FACE_TOKEN,
});
// Omit this if you want to use OpenAI LLM as default otherwise set to your preferred LLM
Settings.llm = new HuggingFaceInferenceAPI({
  model: "meta-llama/Meta-Llama-3-8B-Instruct",
  accessToken: process.env.HUGGING_FACE_TOKEN,
});

async function main() {
  // Load essay from abramov.txt in Node
  const path = "node_modules/llamaindex/examples/abramov.txt";

  const essay = await fs.readFile(path, "utf-8");

  // Create Document object with essay
  const document = new Document({ text: essay, id_: path });

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

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
