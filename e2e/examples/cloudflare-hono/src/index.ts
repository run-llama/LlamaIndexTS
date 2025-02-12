import { Hono } from "hono";

type Bindings = {
  OPENAI_API_KEY: string;
  PINECONE_API_KEY: string;
};

const app = new Hono<{
  Bindings: Bindings;
}>();

app.post("/llm", async (c) => {
  //#region init envs
  const { setEnvs } = await import("@llamaindex/env");
  setEnvs(c.env);
  //#endregion

  const { message } = await c.req.json();

  const {
    extractText,
    QueryEngineTool,
    VectorStoreIndex,
    Settings,
    SentenceSplitter,
  } = await import("llamaindex");

  const { OpenAIAgent, OpenAI, OpenAIEmbedding } = await import(
    "@llamaindex/openai"
  );

  const { PineconeVectorStore } = await import("@llamaindex/pinecone");

  Settings.llm = new OpenAI({
    model: "gpt-4o-mini",
    apiKey: c.env.OPENAI_API_KEY,
  });

  Settings.embedModel = new OpenAIEmbedding({
    model: "text-embedding-3-small",
    apiKey: c.env.OPENAI_API_KEY,
  });

  Settings.nodeParser = new SentenceSplitter({
    chunkSize: 8191,
    chunkOverlap: 0,
  });

  const store = new PineconeVectorStore({
    namespace: "8xolsn4ulEQGdhnhP76yCzfLHdOZ",
  });

  const index = await VectorStoreIndex.fromVectorStore(store);

  const retriever = index.asRetriever({
    similarityTopK: 3,
  });

  // Create a query engine
  const queryEngine = index.asQueryEngine({
    retriever,
  });

  const tools = [
    new QueryEngineTool({
      queryEngine: queryEngine,
      metadata: {
        name: "business_info_tool",
        description:
          "This tool can answer questions based " +
          "on business information. Return not found if you" +
          " can't find the answer in the documents.",
      },
    }),
  ];

  const agent = new OpenAIAgent({ tools });

  const response = await agent.chat({
    message: message,
  });

  return new Response(extractText(response.message.content));
});

export default {
  fetch: app.fetch,
};
