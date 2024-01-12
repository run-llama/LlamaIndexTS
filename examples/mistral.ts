import * as fs from "fs/promises";
import {
  BaseEmbedding,
  Document,
  LLM,
  MistralAI,
  MistralAIEmbedding,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

async function rag(llm: LLM, embedModel: BaseEmbedding, query: string) {
  // Load essay from abramov.txt in Node
  const path = "node_modules/llamaindex/examples/abramov.txt";

  const essay = await fs.readFile(path, "utf-8");

  // Create Document object with essay
  const document = new Document({ text: essay, id_: path });

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const serviceContext = serviceContextFromDefaults({ llm, embedModel });

  const index = await VectorStoreIndex.fromDocuments([document], {
    serviceContext,
  });

  // Query the index
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query(query);
  return response.response;
}

(async () => {
  // embeddings
  const embedding = new MistralAIEmbedding();
  const embeddingsResponse = await embedding.getTextEmbedding(
    "What is the best French cheese?",
  );
  console.log(
    `MistralAI embeddings are ${embeddingsResponse.length} numbers long\n`,
  );

  // chat api (non-streaming)
  const llm = new MistralAI({ model: "mistral-tiny" });
  const response = await llm.chat({
    messages: [{ content: "What is the best French cheese?", role: "user" }],
  });
  console.log(response.message.content);

  // chat api (streaming)
  const stream = await llm.chat({
    messages: [
      { content: "Who is the most renowned French painter?", role: "user" },
    ],
    stream: true,
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.delta);
  }

  // rag
  const ragResponse = await rag(
    llm,
    embedding,
    "What did the author do in college?",
  );
  console.log(ragResponse);
})();
