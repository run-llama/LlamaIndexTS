import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

export const runtime = "nodejs";

export async function GET(_request: Request) {
  // Load essay from abramov.txt in Node
  const essay = await fs.readFile("./public/abramov.txt", "utf-8");

  // Create Document object with essay
  const document = new Document({ text: essay });

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Query the index
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query(
    "What did the author do in college?",
  );

  // Output response
  return Response.json(response.toString());
}
