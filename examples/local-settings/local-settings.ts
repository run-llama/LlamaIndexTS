import { OpenAI, OpenAIEmbedding } from "@llamaindex/openai";
import express, { Request, Response } from "express";
import fs from "fs/promises";
import { Document, Settings, VectorStoreIndex } from "llamaindex";

const app = express();
const port = 3000;

app.get("/default", async (req: Request, res: Response) => {
  const embedModel = new OpenAIEmbedding({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const llm = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const llmResponse = await Settings.withEmbedModel(embedModel, async () => {
    return Settings.withLLM(llm, async () => {
      const path = "node_modules/llamaindex/examples/abramov.txt";
      const essay = await fs.readFile(path, "utf-8");
      // Create Document object with essay
      const document = new Document({ text: essay, id_: path });
      // Split text and create embeddings. Store them in a VectorStoreIndex
      const index = await VectorStoreIndex.fromDocuments([document]);
      // Query the index
      const queryEngine = index.asQueryEngine();
      const { message, sourceNodes } = await queryEngine.query({
        query: "What did the author do in college?",
      });
      // Return response with sources
      return message.content;
    });
  });
  // res.send(message.content)
  res.send(llmResponse);
});

app.get("/custom", async (req: Request, res: Response) => {
  const embedModel = new OpenAIEmbedding({
    apiKey: process.env.OPENAI_API_KEY,
    model: "text-embedding-3-small",
  });
  const llm = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-3.5-turbo",
  });

  const llmResponse = await Settings.withEmbedModel(embedModel, async () => {
    return Settings.withLLM(llm, async () => {
      const path = "node_modules/llamaindex/examples/abramov.txt";
      const essay = await fs.readFile(path, "utf-8");
      // Create Document object with essay
      const document = new Document({ text: essay, id_: path });
      // Split text and create embeddings. Store them in a VectorStoreIndex
      const index = await VectorStoreIndex.fromDocuments([document]);
      // Query the index
      const queryEngine = index.asQueryEngine();
      const { message, sourceNodes } = await queryEngine.query({
        query: "What did the author do in college?",
      });
      // Return response with sources
      return message.content;
    });
  });
  // res.send(message.content)
  res.send(llmResponse);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
