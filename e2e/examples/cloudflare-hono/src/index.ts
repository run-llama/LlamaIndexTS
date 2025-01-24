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

  const { extractText } = await import("@llamaindex/core/utils");

  const {
    QueryEngineTool,
    serviceContextFromDefaults,
    VectorStoreIndex,
    OpenAIAgent,
    Settings,
    OpenAI,
    OpenAIEmbedding,
  } = await import("llamaindex");

  const { PineconeVectorStore } = await import("llamaindex/vector-store");

  const llm = new OpenAI({
    model: "gpt-4o-mini",
    apiKey: c.env.OPENAI_API_KEY,
  });

  Settings.embedModel = new OpenAIEmbedding({
    model: "text-embedding-3-small",
    apiKey: c.env.OPENAI_API_KEY,
  });

  const serviceContext = serviceContextFromDefaults({
    llm,
    chunkSize: 8191,
    chunkOverlap: 0,
  });

  const store = new PineconeVectorStore({
    namespace: "8xolsn4ulEQGdhnhP76yCzfLHdOZ",
  });

  const index = await VectorStoreIndex.fromVectorStore(store, serviceContext);

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
